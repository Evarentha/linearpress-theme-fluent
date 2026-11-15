# Fluent 2 主题

[![LinearPress](https://img.shields.io/badge/LinearPress-theme-7C3AED.svg)](https://www.npmjs.com/package/@evarentha/linearpress) [![npm](https://img.shields.io/npm/v/@evarentha/linearpress-theme-fluent.svg)](https://www.npmjs.com/package/@evarentha/linearpress-theme-fluent) [![License: GPL-3.0-or-later](https://img.shields.io/badge/License-GPL--3.0--or--later-blue.svg)](LICENSE)

[English](README.md) | **简体中文**

按微软 Fluent 2 设计规范制作的 LinearPress 4 主题：后台的外观和动效与 Microsoft 365 应用一致，前台博客是中性底色上的 Fluent 卡片。支持浅色、深色和任意品牌色。

## 改了什么

主题只替换三个布局（`layouts/web`、`layouts/admin`、`layouts/auth`），并重新绘制共享组件。核心页面和所有插件页面保留各自的结构，直接以 Fluent 样式呈现，插件不需要为 Fluent 写任何代码。（3.x 覆盖了二十个核心模板并打包 Fluent Web Components，导致插件页面错乱。）

- **设计令牌**：中性灰阶、Web 品牌色板、状态色、shadow2–64 阴影、2/4/6/8 圆角、Segoe UI 字号层级以及动效时长和曲线，均取自微软 `@fluentui/tokens` 的浅色与深色主题数值，并映射到 LinearPress 的 `--lp-*` 约定。
- **组件**按 Fluent UI v9 的样式实现：32px 按钮（主要、默认、轻量）、带品牌色下划线动画的输入框、复选框、单选框、开关、选中指示条会滑动的标签栏、填充卡片（shadow4，悬停 shadow8）、消息栏、浅色徽章、表格、菜单（shadow16，滑入）、对话框（从 0.85 缩放到 1，250ms 减速）、右下角通知。
- **后台框架**：48px 应用栏和 260px 导航抽屉；导航使用 Fluent System Icons，选中时从线框图标切换为填充图标，左侧 4×20 品牌色指示条；面包屑；窗口小于 1024px 时导航变为覆盖式抽屉。
- **前台**：亚克力材质的吸顶页头，导航是 Fluent 标签栏；首页大卡片介绍区、可点击的文章卡片、文章与评论放在同一张文档卡片里；登录页采用微软账户风格的卡片。
- **动效**：页面间切换为快速淡入淡出（浏览器支持时使用视图过渡），框架保持不动；导航和标签的指示条在项目间移动；列表以短间隔依次进入。系统开启“减少动态效果”时全部关闭。

## 品牌色

外观 → Fluent 主题（`/admin/appearance/fluent`）。选择预设或任意颜色，主题以它为第 80 级生成 16 级色板，保存前整个后台会实时预览。默认是微软 Web 品牌色板（`#0f6cbd`）。保存后立即生效，无需重启。

## 安装

LinearPress 4 已内置。其他安装方式：把仓库放到 `src/plugins/fluentui-theme`（目录名必须等于插件 id），然后在“外观”中选择它。

需要较新的浏览器（Chrome/Edge 111+、Firefox 113+、Safari 16.2+）；视图过渡和 `@starting-style` 动画在不支持的浏览器中会自动省略。

## 致谢

图标：[Fluent System Icons](https://github.com/microsoft/fluentui-system-icons)，MIT 许可，© Microsoft Corporation。设计令牌遵循 [Fluent 2](https://fluent2.microsoft.design)。详见 [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md)。

## 许可

GPL-3.0-or-later，见 [LICENSE](LICENSE)。
