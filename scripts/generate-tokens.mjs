#!/usr/bin/env node
/*
 * Fluent Official Token Generator
 *
 * Generates the full token CSS from official @fluentui/tokens (optional
 * upgrade path).
 *
 * Authors:
 * MoyuZJ <moyuzj@moyuzj.cn> @LinearTeam - Made in China with ♥
 *
 * Copyright (C) 2026 Evarentha
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Generates the complete token CSS from the official @fluentui/tokens package
 * (an optional upgrade path).
 * <p>Usage:</p>
 * <ul>
 * <li>npm i @fluentui/tokens@1.0.0-alpha.24</li>
 * <li>node scripts/generate-tokens.mjs (writes public/fluent-tokens-official.css)</li>
 * </ul>
 * <p>The bundled public/fluent-tokens.css is a hand-maintained curated set
 * (light/dark) that already covers every component variable the theme uses.
 * To align with the latest official alpha values, run this script and replace
 * the bundled file with its output (then re-test all pages afterwards).</p>
 * @since 1.0.0
 */

import { writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

async function main() {
  let tokens;
  try {
    tokens = await import('@fluentui/tokens');
  } catch {
    console.error('未安装 @fluentui/tokens，请先执行：npm i @fluentui/tokens@1.0.0-alpha.24');
    process.exit(1);
  }
  const { webLightTheme, webDarkTheme, themeToTokensObject } = tokens;
  const light = themeToTokensObject(webLightTheme);
  const dark = themeToTokensObject(webDarkTheme);

  const css = (selector, obj) =>
    `${selector} {\n` + Object.entries(obj).map(([k, v]) => `  --${k}: ${v};`).join('\n') + '\n}\n';

  const out = [
    '/* 由 scripts/generate-tokens.mjs 自动生成（@fluentui/tokens 官方值）。 */',
    css(':root', light),
    css(':root[data-theme="dark"]', dark),
  ].join('\n');

  const dest = path.join(ROOT, 'public', 'fluent-tokens-official.css');
  await writeFile(dest, out);
  console.log(`已生成 ${dest}（浅色 ${Object.keys(light).length} 项 / 深色 ${Object.keys(dark).length} 项）`);
  console.log('注意：官方 alpha 包不包含字体/间距/圆角等全局令牌，仅覆盖颜色相关变量。');
}

main().catch((error) => { console.error(error); process.exit(1); });