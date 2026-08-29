<!--
  Author: MoyuZJ
  Team: LinearTeam
  Contact: linearteam@foxmail.com
  Made by MoyuZJ in China with ♥
-->

# Fluent UI Theme / Fluent UI 主题

A complete **Fluent 2** theme for LinearPress: the whole frontend **and** admin are Fluent-styled, with built-in light/dark modes. The Fluent Web Components bundle is vendored into `public/vendor/` — **fully offline, zero external dependencies** (no CDN needed).

LinearPress 的完整 **Fluent 2** 主题插件：前台 + 后台全部界面 Fluent 化，内置浅色/深色模式。Fluent Web Components 全量打包进 `public/vendor/`，**完全离线、零外部依赖**。

> Independent plugin repository for LinearPress **theme** plugin `fluentui-theme`. A theme is just a plugin: it overrides global templates with a `views` directory, extends routes with `web.register()`, and injects configuration through hooks.
> 这是 LinearPress 主题插件 **fluentui-theme** 的独立仓库。主题即插件：用 `views` 目录覆盖全局模板、`web.register()` 扩展路由、Hook 注入配置。

## Why Plugins? / 插件化的优势

- **Theme without forking** —— overrides `layouts/web`, `layouts/admin`, `web/index`, `web/post` and ten core admin pages purely through the view-override mechanism.
  **做主题不改核心**——全部通过视图覆盖机制实现，不用 fork 本体一行代码。
- **Swappable** —— disable this theme and enable another; core and other plugins are unaffected.
  **即装即用可换**——停用本主题换别的主题即可，核心与其它插件不受影响。
- **Configurable** —— the "Theme Appearance" page in admin visualizes toggles/font sizes/brand colors; config is saved to plugin config — **applies instantly, no restart**.
  **外观可配置**——后台「主题外观」页可视化调节显示开关/字号/品牌色，配置存插件配置，**保存即生效、无需重启**。

## Features / 功能

- **Frontend / 前台**：layout, home post list, article page, comments, archive (`/archive`), login/register and error pages — all Fluent. 布局、首页列表、文章页、评论区、归档、登录/注册、错误页全 Fluent 化。
- **Admin / 后台**：admin app shell（left nav / content / right panel）+ ten core pages; plugin pages (modern editor, media library, 2FA, captcha…) render inside the Fluent shell with their own CSS. 应用壳 + 十个核心页；插件页面渲染在 Fluent 外壳内。
- **Dark mode / 深色模式**：switch in both frontend and admin headers, follows the system by default; no flash on first paint（CSS variables + inline pre-paint script）.
- **Self-contained / 自包含**：Fluent tokens as pure CSS variables（light + dark）, components fully bundled — no unpkg/jsdelivr/Tailwind.

## Appearance Configuration / 主题外观配置

Admin → 🎨 Theme Appearance（`/admin/fluentui-theme/settings`）:

- **Show/hide** / 显示开关：home eyebrow / title / subtitle
- **Font size** / 字号：title & subtitle px presets
- **Brand color** / 品牌色：light & dark mode brand colors（buttons/links/badges follow; derived shades via `color-mix`）
- **Live preview** / 实时预览：changes apply instantly without saving
- **Reset** / 恢复默认：back to official Fluent blue

## Install / 安装

```bash
# Option 1 — workspace sync（工作区同步，推荐）
cd base
sh scripts/sync-plugins.sh fluentui-theme
npm run typecheck
# restart to take effect / 重启生效

# Option 2 — admin ZIP / npm install（后台 ZIP / npm 安装）
```

## Local Development / 本地开发：怎么拉 / 怎么改 / 怎么跑

```bash
# 1. Pull / 拉
git clone https://github.com/Averithen/linearpress-theme-fluent Plugins/fluentui-theme

# 2. Edit / 改：index.ts / views/ / public/ / src/config.ts

# 3. Run / 跑
cd base
npm install
npm run db:init
sh scripts/sync-plugins.sh fluentui-theme
npm run dev              # → http://localhost:3000
```

After changes：`sh scripts/sync-plugins.sh fluentui-theme` then restart / 改后重新同步并重启。

## View Registration / 视图注册机制（key / 关键）

Express views order is built in two phases: bootstrap collects manifest `views` by `load_order`; **activate re-appends dirs from `web.viewDir()` calls**, and the final array is reversed so "last appended wins". Therefore：

- This theme **deliberately omits the `views` field in plugin.json** and registers via `web.viewDir()` in `index.ts`（same mechanism as colorful-profiles）so it wins view lookups.
  **刻意不在 plugin.json 声明 views 字段**，改为 activate 阶段 `web.viewDir()` 注册，保证视图覆盖优先。
- To let another plugin's page win：drag it AFTER this theme in the Plugins page（larger `load_order`）.
  **想让某插件页面反超**：在「插件」页把它拖到本主题之后。

## Assets / 静态资源

| File / 文件 | Purpose / 作用 |
| --- | --- |
| `public/vendor/web-components-all.min.js` | `@fluentui/web-components@3.1.3` bundled ESM（deps inlined） |
| `public/fluent-tokens.css` | Design tokens：`:root` light + `:root[data-theme="dark"]` dark |
| `public/fluentui-theme.css` | Frontend styles（scoped `.fluent-site`） |
| `public/fluentui-admin.css` | Admin styles（scoped `.fluent-admin`） |
| `public/fluent-init.js` | Guarded component registration, dark mode, admin drawer |

Re-vendor：`node scripts/vendor.mjs`（needs network once，commit the result）；optional official tokens：`npm i @fluentui/tokens@1.0.0-alpha.24 && node scripts/generate-tokens.mjs`。

## Coexistence / 与其它插件共存

**Default takeover / 默认接管**：`layouts/web|admin`, `web/index|post|archive`, `auth/login|register`, `error`, admin `dashboard|posts|comments|users|groups|plugins|plugin-settings|settings|seo|about`.
**Not overridden / 刻意不覆盖**：`admin/post-edit`（modern editor）、OOBE、plugin pages（media/2FA/captcha/shuoshuo/custom-pages/import/SSO/colorful-profiles…）— they render inside the Fluent shell with their own CSS.
**Same-path conflicts / 同路径冲突**（shuoshuo `web/index`、advanced-comments `web/post`、colorful-profiles `layouts/web`）：theme wins by default; raise a plugin's `load_order` to let its page win. The templates are compatible with shuoshuo helpers（`isShuoShuo`/`shuoshuoHtml`）and easy-captcha's injection anchor.

## Directory / 目录结构

```text
fluentui-theme/
├── plugin.json            Manifest（type: theme）
├── index.ts               entry：viewDir registration / /archive / site:locals / appearance routes
├── src/config.ts          appearance schema / form parsing / CSS override builder
├── views/                 layouts / web / auth / error / admin (10 core + appearance settings)
├── public/                vendor bundle + tokens + front/admin styles + init script
└── scripts/               vendor / generate-tokens
```

## Contribute & Release / 贡献与发布

- conventional commits（`feat:` / `fix:` / `docs:`）；before commit：`cd base && npm run typecheck`
- Version：`git tag v1.0.0 && git push --tags`
- License：MIT（LICENSE）

## Roadmap / 规划

Card density, footer toggles, custom background color（increment on `src/config.ts` schema）.
卡片密度、页脚开关、自定义背景色等（可在配置 Schema 上增量扩展）。