# Fluent 2 Theme

[![LinearPress](https://img.shields.io/badge/LinearPress-theme-7C3AED.svg)](https://www.npmjs.com/package/@evarentha/linearpress) [![npm](https://img.shields.io/npm/v/@evarentha/linearpress-theme-fluent.svg)](https://www.npmjs.com/package/@evarentha/linearpress-theme-fluent) [![License: GPL-3.0-or-later](https://img.shields.io/badge/License-GPL--3.0--or--later-blue.svg)](LICENSE)

**English** | [简体中文](README.zh-CN.md)

A LinearPress 4 theme built to Microsoft's Fluent 2 design system: the admin console looks and moves like a Microsoft 365 app, and the public blog reads as Fluent cards on a neutral canvas. Light and dark modes, any brand color.

## What it changes

The theme only replaces the three layouts (`layouts/web`, `layouts/admin`, `layouts/auth`) and restyles the shared components. Every core page and every plugin page keeps its own markup and simply renders in Fluent, so plugins need no Fluent-specific code. (3.x replaced twenty core templates and bundled Fluent Web Components, which broke plugin pages.)

- **Tokens**: neutral greys, the web brand ramp, status colors, shadow2–64, radius 2/4/6/8, the Segoe UI type ramp and motion durations/curves come from Microsoft's `@fluentui/tokens` (light and dark theme values), mapped onto the LinearPress `--lp-*` contract.
- **Components** follow the Fluent UI v9 styles: 32px buttons (primary, default, subtle), outline inputs with the animated brand underline, Checkbox, Radio, Switch, TabList with the sliding selection indicator, filled Cards (shadow4, shadow8 on hover), MessageBar, tint Badges, Table, Menu (shadow16, slides in), Dialog (scale 0.85 → 1, 250ms decelerate), Toast (bottom-end).
- **Admin shell**: 48px app bar and a 260px Nav drawer with Fluent System Icons that switch from regular to filled when selected, the 4×20 brand indicator, breadcrumbs, and an overlay drawer below 1024px.
- **Public site**: acrylic sticky header whose navigation is a TabList, a hero card, interactive post cards, a document card for articles and comments, and a Microsoft-style sign-in card.
- **Motion**: top-level navigation cross-fades (view transitions where supported), the shell stays put, the nav and tab indicators move between items, lists enter with a short stagger. `prefers-reduced-motion` turns it off.

## Brand color

Appearance → Fluent 主题 (`/admin/appearance/fluent`). Pick a preset or any color; the theme builds a 16-step ramp around it (step 80) and the whole admin previews it live before you save. The default is Microsoft's web brand ramp (`#0f6cbd`). Saving applies immediately, no restart.

## Install

Bundled with LinearPress 4. For another checkout: put the repository at `src/plugins/fluentui-theme` (the directory must match the plugin id), then choose it under Appearance.

Requires a current browser (Chrome/Edge 111+, Firefox 113+, Safari 16.2+); view transitions and `@starting-style` animations are progressive.

## Credits

Icons: [Fluent System Icons](https://github.com/microsoft/fluentui-system-icons), MIT License, © Microsoft Corporation. Design tokens follow [Fluent 2](https://fluent2.microsoft.design). See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md).

## License

GPL-3.0-or-later. See [LICENSE](LICENSE).
