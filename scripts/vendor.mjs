#!/usr/bin/env node
/*
 * Author: MoyuZJ
 * Team: LinearTeam
 * Contact: linearteam@foxmail.com
 * Made by MoyuZJ in China with ♥
 */

/*
 * vendor.mjs —— 将 @fluentui/web-components 全量 bundle 下载到 public/vendor/。
 *
 * 用法：node scripts/vendor.mjs
 * 说明：bundle 为 ESM 且依赖已全部内联（fast-element/tslib 等），
 *      可直接 <script type="module" src="/plugins/fluentui-theme/vendor/..."> 使用。
 *      本脚本结果应提交进 git，随插件包分发，保证主题完全离线可用。
 */

import { writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = '3.1.3';
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
    const dest = path.join(vendorDir, name);
    await writeFile(dest, buf);
    console.log(`[vendor] ${name} (${(buf.length / 1024).toFixed(1)} KB) -> ${dest}`);
    const text = buf.slice(0, 2000).toString('utf8');
    if (!text.includes('prefix')) console.warn('[vendor] 警告：bundle 内容异常，请检查版本与来源');
  }
  console.log('[vendor] 完成，请将 public/vendor 提交进 git。');
}

main().catch((error) => { console.error('[vendor] 失败：', error.message); process.exit(1); });