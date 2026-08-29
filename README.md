<!--
  Author: MoyuZJ
  Team: LinearTeam
  Contact: linearteam@foxmail.com
  Made by MoyuZJ in China with ♥
-->

# Fluent UI 主题（fluentui-theme）

LinearPress 的完整 **Fluent 2** 主题插件：前台 + 后台全部界面 Fluent 化，内置浅色/深色模式，
Fluent Web Components 全量打包进 `public/vendor/`，完全离线、零外部依赖（不依赖任意 CDN）。

> 本仓库是 LinearPress 主题插件 **fluentui-theme** 的独立开发仓库。主题即插件：
> 用 `views` 目录覆盖全局模板、`web.register()` 扩展路由、Hook 注入配置。

## 插件化的优势

- **做主题不改核心**：覆盖 `layouts/web`、`layouts/admin`、`web/index`、`web/post`、后台十个核心页——全部通过视图覆盖机制实现，不用 fork 本体一行代码。
- **即装即用可换**：想换主题？停用本插件、启用另一个主题即可，核心与其它插件不受影响。
- **外观可配置**：后台「主题外观」页可视化调节显示开关/字号/品牌色，配置存插件配置，**保存即生效、无需重启**。

## 功能

- **前台**：布局、首页文章列表、文章阅读页、评论区、归档页（`/archive`）、登录/注册页、错误页全部 Fluent 化。
- **后台**：控制台应用壳（左侧导航/内容区/右侧详情面板）、十个核心管理页全部 Fluent 化；现代编辑器等插件页面渲染在 Fluent 外壳内。
- **深色模式**：前台与后台 header 均有切换开关，默认跟随系统；首屏无闪烁（CSS 变量预置 + 内联脚本）。
- **自包含**：Fluent 令牌是纯 CSS 变量（浅/深两套），组件全量 bundle 打进包内，不依赖 unpkg/jsdelivr/Tailwind。

## 主题外观配置（已实现）

后台左侧「🎨 主题外观」或插件卡片「主题外观」进入 `/admin/fluentui-theme/settings`：

- **显示开关**：首页眉题 / 主标题 / 副标题是否显示
- **字号**：主标题、副标题 px 预设
- **品牌色**：浅色模式与深色模式各自的主色（按钮、链接、徽标等全量跟随，衍生色由 color-mix 推导）
- **实时预览**：修改即时生效，无需保存即可预览
- **恢复默认**：一键回到官方 Fluent 蓝

## 安装

方式一（推荐，开发/自托管）：同步到运行目录

```bash
cd base
sh scripts/sync-plugins.sh fluentui-theme
npm run typecheck
# 重启服务即可生效
```

方式二：插件管理页 → 上传 ZIP / npm 安装（需先把插件打包）。

## 本地开发：怎么拉 / 怎么改 / 怎么跑

```bash
# 1. 拉：克隆到工作区（或直接放入 src/plugins/fluentui-theme，目录名必须等于插件 id）
git clone <本仓库地址> Plugins/fluentui-theme

# 2. 改：直接编辑 index.ts / views/ / public/ / src/config.ts

# 3. 跑：同步 + 启动
cd base
npm install
npm run db:init          # 首次
sh scripts/sync-plugins.sh fluentui-theme
npm run dev              # http://localhost:3000
```

改代码后重新 `sh scripts/sync-plugins.sh fluentui-theme` 并重启服务即可看到效果。

## 视图注册机制（关键）

LinearPress 的 Express `views` 搜索顺序分两个阶段——bootstrap 按 `load_order` 收集 manifest 的 `views` 字段，
activate 阶段再按 `load_order` 依次执行插件调用 `web.viewDir()` 追加的目录，最终数组反转后
「最后追加的目录最先被查找」。因此：

- 本主题**刻意不在 plugin.json 声明 `views` 字段**，改在入口 `index.ts` 的 activate 阶段调用 `web.viewDir()` 注册
  （与 colorful-profiles 同款机制），保证视图目录排在查询顺序最前、覆盖核心与其它插件视图。
- 想让某个插件的页面反超本主题：在「插件」页把它拖到本主题**之后**（`load_order` 更大，越晚激活的插件 viewDir 越靠前）。

## 静态资源

| 文件 | 作用 |
| --- | --- |
| `public/vendor/web-components-all.min.js` | `@fluentui/web-components@3.1.3` 全量 ESM bundle（已内联全部依赖） |
| `public/fluent-tokens.css` | 设计令牌：`:root` 浅色 + `:root[data-theme="dark"]` 深色 |
| `public/fluentui-theme.css` | 前台样式（`.fluent-site` 作用域） |
| `public/fluentui-admin.css` | 后台样式（`.fluent-admin` 作用域） |
| `public/fluent-init.js` | 前台/后台共用：组件守卫注册、深色切换、后台抽屉交互 |

重新拉取 bundle：`node scripts/vendor.mjs`（需联网一次，结果提交 git）；
可选生成官方令牌：`npm i @fluentui/tokens@1.0.0-alpha.24 && node scripts/generate-tokens.mjs`。

## 与其它插件共存

**默认接管**：`layouts/web` / `layouts/admin`、`web/index|post|archive`、`auth/login|register`、`error`、
后台 `dashboard|posts|comments|users|groups|plugins|plugin-settings|settings|seo|about`。

**刻意不覆盖**：`admin/post-edit`（现代编辑器）、OOBE、各插件自有页面（媒体库/2FA/验证码/说说管理/自定义页面/导入/SSO/多彩资料 等）——它们渲染在 Fluent 外壳内并自带样式。

**同路径冲突**（如 shuoshuo 的 `web/index`、高级评论的 `web/post`、多彩资料的 `layouts/web`）：默认本主题接管；
想保留某插件的专属页面，把它在「插件」页拖到本主题之后（`load_order` 更大）即可。
前台模板兼容 shuoshuo 的模板辅助（`isShuoShuo` / `shuoshuoHtml`）与 easy-captcha 的验证码注入锚点。

## 目录结构

```text
fluentui-theme/
├── plugin.json            Manifest（type: theme）
├── index.ts               入口：视图注册 / /archive / site:locals 注入 / 主题外观路由
├── src/config.ts          外观配置：Schema / 表单解析 / CSS 覆盖生成
├── views/
│   ├── layouts/web.ejs|admin.ejs
│   ├── web/index|post|archive.ejs
│   ├── auth/login|register.ejs
│   ├── error.ejs
│   └── admin/*.ejs        后台 10 个核心页 + 主题外观设置页
├── public/
│   ├── vendor/            Fluent Web Components 全量 bundle
│   ├── fluent-tokens.css  设计令牌（浅/深）
│   ├── fluentui-theme.css 前台样式
│   ├── fluentui-admin.css 后台样式
│   └── fluent-init.js     组件守卫注册 + 深色模式 + 后台抽屉
└── scripts/               vendor / generate-tokens
```

## 贡献与发布

- conventional commits（`feat:` / `fix:` / `docs:`）；提交前 `cd base && npm run typecheck`
- 版本：`git tag v1.0.0 && git push --tags`
- License：MIT（见仓库 LICENSE）

## 二〇三期规划

卡片密度、页脚开关、自定义背景色等更多视觉项（可在 `src/config.ts` 的 Schema 上增量扩展）。