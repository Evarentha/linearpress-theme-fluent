# Fluent UI Theme

[![LinearPress](https://img.shields.io/badge/LinearPress-plugin-7C3AED.svg)](https://www.npmjs.com/package/@evarentha/linearpress) [![npm](https://img.shields.io/npm/v/@evarentha/linearpress-theme-fluent.svg)](https://www.npmjs.com/package/@evarentha/linearpress-theme-fluent) [![Node.js](https://img.shields.io/badge/node-%3E%3D22-green.svg)](https://nodejs.org) [![TypeScript](https://img.shields.io/badge/TypeScript-strict-blue.svg)](https://www.typescriptlang.org) [![License: GPL-3.0-or-later](https://img.shields.io/badge/License-GPL--3.0--or--later-blue.svg)](LICENSE)

**English** | [简体中文](README.zh-CN.md)

A complete Fluent 2 theme for LinearPress, restyling both the public site and the admin console, with light and dark modes, running fully offline. It needs a modern browser: the CSS uses `color-mix()` and `backdrop-filter`, so the floor is Chrome 111, Firefox 113, or Safari 16.2. Changing the theme's appearance requires the base `site:manage` permission.

## Install

```bash
git clone https://github.com/Evarentha/linearpress-theme-fluent.git src/plugins/fluentui-theme
```

The directory name must equal the plugin id, which is `fluentui-theme`, not the repository name. Restart afterwards, or sync from the `base` checkout (`sh scripts/sync-plugins.sh fluentui-theme`), or upload the ZIP / npm name from the admin Plugins page.

## What it covers

Site and admin layout shells, with burger and drawer navigation, grouped menus with children, and a right detail panel in the admin; the home page, the post reading page with its comment form, a month-grouped archive at the theme's own `GET /archive` route, login, register, an error page, and 11 admin pages. Everything follows the Fluent 2 design language.

Dark mode follows your system preference until you flip the switch in the site header or the admin top bar; after that the choice is remembered per browser and synced across open tabs. The plumbing: a hand-curated sheet of 480 CSS variables, one set under `:root` for light and one under `:root[data-theme="dark"]` for dark, plus an inline script that sets `data-theme` before the first paint, so the wrong theme never flashes, and `fluent-init.js` listening for `storage` events so tabs follow each other.

`@fluentui/web-components` 3.1.3 is vendored as a single ESM bundle of about 300 KB with all dependencies inlined, committed to git; runtime makes no CDN or external requests, and `fluent-init.js` registers exactly the 18 components in use.

## Customizing

Open Theme Appearance in the admin sidebar (or the link on the plugin's card) at `/admin/fluentui-theme/settings`: show or hide the hero eyebrow, site title, and subtitle; pick hero title and subtitle sizes (presets of 24 to 48 px and 12 to 20 px; the underlying values are clamped to the 12 to 96 range); choose separate accent colors for light and dark as 6-digit hex, with hover and pressed shades derived through `color-mix()` and previewed live. The config is read on every request, so a save applies immediately without a restart, and one click on reset restores the defaults (light `#0f6cbd`, dark `#479ef5`). Settings live in the standard plugin config store; the theme defines no new permissions and creates no tables.

## How themes work here

In LinearPress a theme is a regular Cordis plugin. This one overrides templates, registers one route, and hooks `site:locals` rather than patching core code, so you install, disable, and swap it like any other plugin. Its `plugin.json` deliberately declares no `views` field; during activate it calls `web.viewDir()`, which puts its templates ahead of core templates and manifest-declared plugin views. When another plugin needs to win a same-path conflict, resolve it by load order on the admin Plugins page.

The modern post editor page, OOBE, and other plugins' own pages are not overridden; they render inside the Fluent shells with their own styles, and OOBE loads core CSS as a special case. The home view feature-detects the shuoshuo helpers and renders shuoshuo as full-text cards with a badge, and the comment and auth forms keep easy-captcha's injection anchors (`.ec-box`) styled.

Two developer scripts: `npm run vendor` re-downloads the web components bundle, prints its sha256, and supports pinning via `LP_VENDOR_SHA256` (the result is committed to git); `npm run tokens` optionally regenerates the token sheet from `@fluentui/tokens`, though the bundled sheet is hand-curated, so this is an upgrade path, not a requirement.

## License

GPL-3.0-or-later, Copyright (C) 2026 Evarentha. See LICENSE.
