# Fluent UI 主题（fluentui-theme）

[![LinearPress](https://img.shields.io/badge/LinearPress-plugin-7C3AED.svg)](https://www.npmjs.com/package/@evarentha/linearpress) [![npm](https://img.shields.io/npm/v/@evarentha/linearpress-theme-fluent.svg)](https://www.npmjs.com/package/@evarentha/linearpress-theme-fluent) [![Node.js](https://img.shields.io/badge/node-%3E%3D22-green.svg)](https://nodejs.org) [![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org) [![License: GPL-3.0-or-later](https://img.shields.io/badge/License-GPL--3.0--or--later-blue.svg)](LICENSE)

[English](README.md) | **简体中文**

一套面向 LinearPress 的完整 Fluent 2 主题，对前台与后台界面统一重塑，内置亮色与暗色模式，完全离线运行。需要较新的浏览器：CSS 使用了 `color-mix()` 与 `backdrop-filter`，版本下限为 Chrome 111、Firefox 113 或 Safari 16.2。修改主题外观需要基础权限 `site:manage`。

## 安装

```bash
git clone https://github.com/Evarentha/linearpress-theme-fluent.git src/plugins/fluentui-theme
```

目录名必须与插件 id 一致，即 `fluentui-theme`，而非仓库名。安装后需重启 LinearPress。也可以在 `base` 检出中执行 `sh scripts/sync-plugins.sh fluentui-theme`，或在后台插件页上传 ZIP、填写 npm 包名。

## 覆盖范围

涵盖前台与后台的布局壳层（汉堡与抽屉导航、带子项的分组菜单、后台右侧详情面板）、首页、附带评论表单的文章阅读页、主题自带的 `GET /archive` 路由提供的按月归档页、登录页、注册页、错误页，以及 11 个后台页面，全部遵循 Fluent 2 设计语言。

暗色模式默认跟随系统偏好；点击站点头部或后台顶栏的开关后，选择按浏览器记忆，并在已打开的标签页之间同步。实现机制：一张手工维护的 480 个 CSS 变量令牌表，亮色定义于 `:root`、暗色定义于 `:root[data-theme="dark"]`；一段内联脚本在首次绘制前设置 `data-theme`，因此不会出现错误主题的闪烁；`fluent-init.js` 监听 `storage` 事件，使各标签页彼此跟随。

`@fluentui/web-components` 3.1.3 以单个 ESM bundle 内联全部依赖后纳入版本库（约 300 KB），运行时不请求任何 CDN 或外部资源；`fluent-init.js` 仅注册使用中的 18 个组件。

## 外观定制

后台侧栏的「主题外观」（或插件卡片上的入口）打开 `/admin/fluentui-theme/settings`：控制眉题、站点标题、副标题的显隐；选择主副标题字号（标题预设 24 至 48 px、副标题预设 12 至 20 px；底层取值范围钳制于 12 至 96）；分别为亮色与暗色指定 6 位十六进制品牌色，悬停与按压色阶由 `color-mix()` 派生并实时预览。配置按请求读取，保存立即生效、无须重启，一键即可恢复默认（亮色 `#0f6cbd`、暗色 `#479ef5`）。设置存储于标准插件配置库；本主题不定义新权限、不创建任何表。

## 主题机制

LinearPress 的主题即普通的 Cordis 插件。本主题通过覆盖模板、注册一条路由、挂载 `site:locals` 实现换肤，不修改核心代码，因此安装、停用、更换均与普通插件一致。其 `plugin.json` 有意不声明 `views` 字段，而在 activate 阶段调用 `web.viewDir()`，由此使其模板排序先于核心模板与 manifest 声明式插件视图。其他插件需要赢得同路径冲突时，在后台插件页调整加载顺序即可。

现代文章编辑页、OOBE、其他插件自有的页面一概不予覆盖，它们以自身样式在 Fluent 壳层内渲染，OOBE 另有加载核心 CSS 的特例。首页视图检测说说的辅助函数并将说说渲染为带标记的全文卡片；评论与登录表单保留并适配 easy-captcha 的注入锚点（`.ec-box`）。

面向开发者的两个脚本：`npm run vendor` 重新下载组件 bundle，打印 sha256，支持通过 `LP_VENDOR_SHA256` 锁定来源，结果纳入版本库；`npm run tokens` 可从 `@fluentui/tokens` 重新生成令牌表，但内置表为手工维护，此项仅为可选的升级路径。

## 许可证

本项目以 GPL-3.0-or-later 许可发布，Copyright (C) 2026 Evarentha，完整文本见 [LICENSE](LICENSE)。
