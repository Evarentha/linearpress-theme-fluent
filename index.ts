/*
 * Fluent Theme Entry Point
 *
 * A Fluent 2 theme for LinearPress: layouts, tokens and component styles, plus the brand color setting.
 *
 * Authors:
 * MoyuZJ <moyuzj@evarentha.com> @LinearTeam - Made in China with ♥
 * worryzu <worryzu@evarentha.com> @LinearTeam
 *
 * Copyright (C) 2026 Evarentha
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * <p>As a v4 theme it only provides the three layouts (views/layouts), the
 * Fluent stylesheets and a little motion script; every page and every
 * plugin keeps its own markup and simply renders with Fluent tokens and
 * components. 3.x replaced twenty core templates and bundled the Fluent Web
 * Components runtime, which broke plugin pages and slots.</p>
 * <p>The only setting is the brand color. Changing it takes effect on the
 * next page view without a restart (the ramp style is rendered into the
 * head slots).</p>
 *
 * @since 1.0.0
 */

import type { Context } from 'cordis';
import { checkPermission, requireAuth, route } from 'linearpress/plugin-api';
import { brandRamp, brandStyle, DEFAULT_BRAND, normalizeConfig, PRESETS, STEPS, type FluentConfig } from './src/config.js';

const PLUGIN_ID = 'fluentui-theme';
const SETTINGS = '/admin/appearance/fluent';

export default async function fluentTheme(ctx: Context): Promise<void> {
  const { web, admin, ui } = ctx.linearpress;
  let config: FluentConfig = normalizeConfig(await ctx.plugins.getConfig(PLUGIN_ID));
  let style = brandStyle(config);

  ui.slot('head', { render: () => style, order: -100 });
  ui.slot('admin.head', { render: () => style, order: -100 });

  admin.registerSettings({ label: 'Fluent 主题', link: SETTINGS, description: '品牌色' });
  for (const old of ['/admin/fluentui-theme/settings', '/admin/fluent-theme']) web.register('get', old, (_req, res) => res.redirect(301, SETTINGS));
  const guard = [requireAuth, checkPermission('site:manage')];
  web.register('get', SETTINGS, ...guard, (_req, res) => {
    res.render(`${PLUGIN_ID}/settings`, { pageTitle: 'Fluent 主题', crumbs: [{ title: '外观', href: '/admin/appearance' }], config, presets: PRESETS, steps: STEPS, ramp: brandRamp(config.brand), defaultBrand: DEFAULT_BRAND });
  });
  web.register('post', SETTINGS, ...guard, route(async (req, res) => {
    const next = normalizeConfig({ brand: req.body?.brand === 'custom' ? req.body?.custom_brand : req.body?.brand });
    config = next;
    style = brandStyle(config);
    await ctx.plugins.setConfig(PLUGIN_ID, config);
    req.flash('success', '品牌色已更新。');
    res.redirect(303, SETTINGS);
  }));

  ctx.logger.info(`activated (brand ${config.brand})`);
}
