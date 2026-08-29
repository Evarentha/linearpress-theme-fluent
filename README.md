<!--
  Author: MoyuZJ
  Team: LinearTeam
  Contact: linearteam@foxmail.com
  Made by MoyuZJ in China with ♥
-->

# Fluent UI 主题（fluentui-theme）

LinearPress 的完整 Fluent 2 主题插件：**前台 + 后台全部界面** Fluent 化，内置浅色/深色模式切换，Fluent Web Components 全量打包进 `public/vendor/`，**完全离线、零外部依赖**（不依赖任意 CDN）。

## 特性

- **前台**：布局、首页文章列表、文章阅读页、评论区、归档页（`/archive`）、登录/注册页、错误页全部 Fluent 化。
- **后台**：控制台应用壳（左侧导航/内容区/右侧详情面板）、十个核心管理页全部 Fluent 化；现代编辑器等插件页面渲染在 Fluent 外壳内。
- **深色模式**：前台与后台 header 均有切换开关，默认跟随系统；首屏无闪烁（CSS 变量预置 + 内联脚本）。
- **自包含**：Fluent 令牌是纯 CSS 变量（浅/深两套），组件全量 bundle 打进包内，不依赖 unpkg/jsdelivr/Tailwind。

## 安装

方式一（推荐，开发/自托管）：同步到运行目录

```bash
cd base
sh scripts/sync-plugins.sh fluentui-theme
npm run typecheck
# 重启服务即可生效
```

方式二：插件管理页 → 上传 ZIP / npm 安装（需先把插件打包）。

## 主题外观配置（已实现）

后台左侧「🖼 主题外观」或插件卡片「主题外观」进入 `/admin/fluentui-theme/settings`：

- **显示开关**：首页眉题 / 主标题 / 副标题是否显示
- **字号**：主标题、副标题 px 预设
- **品牌色**：浅色模式与深色模式各自的主色（按钮、链接、徽标等全量跟随，衍生色由 color-mix 推导）
- **实时预览**：修改即时生效，无需保存即可预览
- **恢复默认**：一键回到官方 Fluent 蓝

配置存于插件配置（`plugins.setConfig('fluentui-theme')`），由 `site:locals` 每请求读取并注入 `<style>` 覆盖设计令牌，**保存后无需重启即生效**（前后台同生效）。

## 静态资源

| 文件 | 作用 |
| --- | --- |
| `public/vendor/web-components-all.min.js` | `@fluentui/web-components@3.1.3` 全量 ESM bundle（已内联全部依赖） |
| `public/fluent-tokens.css` | 设计令牌：`:root` 浅色 + `:root[data-theme="dark"]` 深色 |
| `public/fluentui-theme.css` | 前台样式（`.fluent-site` 作用域） |
| `public/fluentui-admin.css` | 后台样式（`.fluent-admin` 作用域） |
| `public/fluent-init.js` | 前台/后台共用：组件守卫注册、深色切换、后台抽屉交互 |

重新拉取 bundle：

```bash
node scripts/vendor.mjs      # 下载到 public/vendor（需联网一次），结果提交 git
node scripts/generate-tokens.mjs  # 可选：从 @fluentui/tokens 生成官方令牌 CSS
```

插件自身通过 manifest 的 `styles` 注入三份 CSS；组件 bundle 与 `fluent-init.js` 是 ESM，
由覆盖后的 `layouts/web.ejs` / `layouts/admin.ejs` 以 `<script type="module">` 显式引入（manifest 的 `scripts` 只支持经典脚本）。

## 视图覆盖与插件共存

**视图注册机制（关键）**：LinearPress 的 Express `views` 搜索顺序分两个阶段——bootstrap 阶段按 `load_order` 收集 manifest 的 `views` 字段，activate 阶段再按 `load_order` 依次执行插件调用 `web.viewDir()` 追加的目录，最终数组反转后「最后追加的目录最先被查找」。因此：

- 本主题**刻意不在 plugin.json 声明 `views` 字段**，改在入口 `index.ts` 的 activate 阶段调用 `web.viewDir()` 注册（与 colorful-profiles 同款机制），保证视图目录排在查询顺序最前、覆盖核心与其它插件视图。
- 想让某个插件的页面反超本主题：在「插件」页把它拖到本主题**之后**（`load_order` 更大，越晚激活的插件 viewDir 越靠前）。

本主题默认接管以下页面：

| 本主题覆盖 | 说明 |
| --- | --- |
| `layouts/web` / `layouts/admin` | 全局布局 |
| `web/index` / `web/post` / `web/archive` | 前台页面（archive 为新增路由） |
| `auth/login` / `auth/register` / `error` | 认证与错误页 |
| `admin/dashboard|posts|comments|users|groups|plugins|plugin-settings|settings|seo|about` | 后台核心页 |

**刻意不覆盖**：`admin/post-edit`（现代编辑器）、OOBE 初始化向导、各插件自有页面
（媒体库/2FA/验证码/说说管理/自定义页面/导入/SSO/多彩资料 等）——它们渲染在本主题的布局外壳内并自带样式。

**同路径冲突的插件页面**（如 shuoshuo 的 `web/index`、高级评论的 `web/post`、多彩资料的 `layouts/web`、
现代编辑器的 `admin/post-edit`）：默认由本主题接管（见上方注册机制）；想保留某个插件的专属页面视图，
在「插件」页把它拖到本主题之后（`load_order` 更大）即可。
本主题的前台模板兼容 shuoshuo 的模板辅助（`isShuoShuo` / `shuoshuoHtml` 存在时自动内联渲染「说说」）
与 easy-captcha 的验证码注入（表单末尾保留一个隐藏的原生 `button[type="submit"]` 作为注入锚点）。

## 深色模式

- 存储键：`localStorage['fluent-theme']`（`light` / `dark` / `system`）
- 默认行为：跟随系统 `prefers-color-scheme`；header 的 `fluent-switch` 手动切换并持久化。
- 令牌：`fluent-tokens.css` 提供 `:root[data-theme="dark"]` 全套深色变量。

## 二〇二期规划（已实现：见上方「主题外观配置」）

暂未开放：卡片密度、页脚开关、自定义背景色等更多视觉项（可在现有配置 Schema 上增量扩展）。

## 开发

```bash
cd base && sh scripts/sync-plugins.sh fluentui-theme && npm run typecheck && npm run dev
```