#!/usr/bin/env node
/*
 * Fluent Vendor Bundle Downloader
 *
 * Downloads the full @fluentui/web-components bundle into public/vendor/.
 *
 * Authors:
 * MoyuZJ <moyuzj@moyuzj.cn> @LinearTeam - Made in China with ♥
 * worryzu <worryzu@gmail.com> @LinearTeam
 *
 * Copyright (C) 2026 Evarentha
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Downloads the full @fluentui/web-components bundle into public/vendor/.
 * <p>Usage: node scripts/vendor.mjs</p>
 * <p>The bundle is ESM with all dependencies inlined (fast-element, tslib,
 * etc.), so it can be used directly via
 * <script type="module" src="/plugins/fluentui-theme/vendor/...">.
 * The result should be committed to git and shipped with the plugin package
 * so the theme stays fully usable offline.</p>
 * @since 1.0.0
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = '3.1.3';
// 可选完整性锁定：设置 LP_VENDOR_SHA256 后，下载内容必须与该哈希一致才写入（防供应链替换）。
const PINNED_SHA256 = (process.env.LP_VENDOR_SHA256 || '').toLowerCase();
const FILES = {
  'web-components-all.min.js': `https://cdn.jsdelivr.net/npm/@fluentui/web-components@${VERSION}/dist/web-components-all.min.js`,
};

async function main() {
  const vendorDir = path.join(ROOT, 'public', 'vendor');
  await mkdir(vendorDir, { recursive: true });
  for (const [name, url] of Object.entries(FILES)) {
    const res = await fetch(url, { signal: AbortSignal.timeout(120_000) });
    if (!res.ok) throw new Error(`下载失败 ${url}（HTTP ${res.status}）`);
    const buf = Buffer.from(await res.arrayBuffer());
    const sha256 = createHash('sha256').update(buf).digest('hex');
    if (PINNED_SHA256 && sha256 !== PINNED_SHA256) throw new Error(`SHA-256 校验失败 ${url}\n  期望 ${PINNED_SHA256}\n  实际 ${sha256}`);
    const dest = path.join(vendorDir, name);
    await writeFile(dest, buf);
    console.log(`[vendor] ${name} (${(buf.length / 1024).toFixed(1)} KB) sha256=${sha256} -> ${dest}`);
    const text = buf.slice(0, 2000).toString('utf8');
    if (!text.includes('prefix')) console.warn('[vendor] 警告：bundle 内容异常，请检查版本与来源');
  }
  console.log('[vendor] 完成，请将 public/vendor 提交进 git。可用上方 sha256 设定 LP_VENDOR_SHA256 固定来源。');
}

main().catch((error) => { console.error('[vendor] 失败：', error.message); process.exit(1); });