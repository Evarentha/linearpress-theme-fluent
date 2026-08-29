#!/usr/bin/env node
/*
 * Author: MoyuZJ
 * Team: LinearTeam
 * Contact: linearteam@foxmail.com
 * Made by MoyuZJ in China with ♥
 */

/*
 * generate-tokens.mjs —— 从官方 @fluentui/tokens 生成完整令牌 CSS（可选，升级路径）。
 *
 * 用法：
 *   npm i @fluentui/tokens@1.0.0-alpha.24
 *   node scripts/generate-tokens.mjs   # 输出 public/fluent-tokens-official.css
 *
 * 说明：仓库内置的 public/fluent-tokens.css 是手工维护的精选令牌（浅/深两套），
 *       已经覆盖主题用到的全部组件变量。若想对齐官方 alpha 最新值，
 *       运行本脚本后用输出的文件替换（注意随后自测一遍所有页面）。
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