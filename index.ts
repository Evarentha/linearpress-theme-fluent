/*
 * Fluent UI Theme Plugin Entry Point
 *
 * Entry point of the Fluent 2 theme plugin for LinearPress.
 *
 * Authors:
 * MoyuZJ <moyuzj@moyuzj.cn> @LinearTeam - Made in China with ♥
 * worryzu <worryzu@gmail.com> @LinearTeam
 *
 * Copyright (C) 2026 Evarentha
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * The Fluent 2 theme plugin for LinearPress.
 * <p>Responsibilities, aligned with the Cordis lifecycle:</p>
 * <ul>
 * <li>View overrides: registers the views directory via web.viewDir() during
 * activate (placed first in the Express view search order so it overrides the
 * core and other plugins); plugin.json deliberately declares no views
 * field.</li>
 * <li>Routes: the /archive page and the /admin/fluentui-theme/settings theme
 * appearance settings page.</li>
 * <li>Hooks: site:locals injects template helpers (archive grouping) and the
 * theme appearance config (including CSS overrides).</li>
 * <li>Static assets: the full Fluent Web Components bundle under public/vendor,
 * loaded as an ES module by the overridden layouts.</li>
 * </ul>
 * @since 1.0.0
 */

import type { Context } from 'cordis';
import type { Request, RequestHandler, Response } from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { checkPermission, requireAuth } from '../../services/permission.service.js';
import {
  FLUENT_THEME_DEFAULTS,
  HERO_SUBTITLE_SIZE_OPTIONS,
  HERO_TITLE_SIZE_OPTIONS,
  buildThemeCss,
  normalizeThemeConfig,
  themeConfigFromForm,
} from './src/config.js';

const PLUGIN_ID = 'fluentui-theme';
const SETTINGS_URL = '/admin/fluentui-theme/settings';

const PLUGIN_DIR = path.dirname(fileURLToPath(import.meta.url));
const PLUGIN_VIEWS = path.join(PLUGIN_DIR, 'views');
const PLUGIN_PUBLIC = path.join(PLUGIN_DIR, 'public');

function messageOf(error: unknown): string { return error instanceof Error ? error.message : '操作失败'; }
const wrap = (fn: (req: Request, res: Response) => Promise<unknown> | unknown): RequestHandler => (req, res) => {
  void Promise.resolve(fn(req, res)).catch((error) => {
    console.error(`[${PLUGIN_ID}] handler error:`, error);
    if (!res.headersSent) res.status(500).render('error', { title: '主题操作失败', message: messageOf(error) });
  });
};

/** 归档分组：输入按 created_at 倒序的文章，输出 [{ month: '2026年01月', items: [...] }] */
function groupByMonth(posts: Array<{ created_at: string }>): Array<{ month: string; items: Array<{ created_at: string }> }> {
  const groups: Array<{ month: string; items: Array<{ created_at: string }> }> = [];
  for (const post of posts) {
    const d = new Date(post.created_at);
    if (Number.isNaN(d.getTime())) continue;
    const key = `${d.getFullYear()}年${String(d.getMonth() + 1).padStart(2, '0')}月`;
    const last = groups[groups.length - 1];
    if (last && last.month === key) last.items.push(post);
    else groups.push({ month: key, items: [post] });
  }
  return groups;
}

async function loadThemeConfig(context: Context): Promise<ReturnType<typeof normalizeThemeConfig>> {
  try {
    const saved = await context.plugins.getConfig(PLUGIN_ID) as unknown;
    return normalizeThemeConfig(saved ?? undefined);
  } catch {
    return FLUENT_THEME_DEFAULTS;
  }
}

export default function fluentUiTheme(context: Context): void {
  const { web, hooks } = context.linearpress;

  // ------------------------------------------------ 视图注册（activate 阶段，保证覆盖优先）
  web.viewDir(PLUGIN_VIEWS);
  web.staticDir(PLUGIN_PUBLIC);

  // ------------------------------------------------ 归档页
  web.register('get', '/archive', wrap(async (_req, res) => {
    const list = await context.posts.listPublished(1000, 0);
    const groups = groupByMonth(list as Array<{ created_at: string }>);
    res.render('web/archive', { title: '归档', posts: list, groups });
  }));

  // ------------------------------------------------ 模板辅助 + 主题外观注入
  hooks.on('site:locals', (locals: Record<string, unknown>) => ({
    ...locals,
    fluentArchiveGroups: (posts: Array<{ created_at: string }>) => groupByMonth(posts)
  }));

  hooks.on('site:locals', async (locals: Record<string, unknown>) => {
    const config = await loadThemeConfig(context);
    return {
      ...locals,
      fluentTheme: config,
      fluentThemeCss: buildThemeCss(config),
    };
  });

  // ------------------------------------------------ 主题外观设置页
  const renderSettings: RequestHandler = wrap(async (req, res) => {
    const config = await loadThemeConfig(context);
    res.render('admin/fluentui-theme', {
      title: '主题外观',
      config,
      titleSizeOptions: HERO_TITLE_SIZE_OPTIONS,
      subtitleSizeOptions: HERO_SUBTITLE_SIZE_OPTIONS,
      defaults: FLUENT_THEME_DEFAULTS,
      notice: String(req.query.notice ?? ''),
    });
  });

  web.register('get', SETTINGS_URL, requireAuth, checkPermission('site:manage'), renderSettings);

  web.register('post', SETTINGS_URL, requireAuth, checkPermission('site:manage'), wrap(async (req, res) => {
    const next = themeConfigFromForm((req.body ?? {}) as Record<string, unknown>);
    await context.plugins.setConfig(PLUGIN_ID, next);
    res.redirect(`${SETTINGS_URL}?notice=saved`);
  }));

  web.register('post', `${SETTINGS_URL}/reset`, requireAuth, checkPermission('site:manage'), wrap(async (_req, res) => {
    await context.plugins.setConfig(PLUGIN_ID, FLUENT_THEME_DEFAULTS);
    res.redirect(`${SETTINGS_URL}?notice=reset`);
  }));

  // ------------------------------------------------ 后台入口：左侧菜单 + 插件卡片按钮
  context.admin.registerMenu({ title: '主题外观', link: SETTINGS_URL, icon: '🎨' });
  context.admin.registerCustomSetting({ label: '主题外观', link: SETTINGS_URL });

  context.logger.info(`activated (settings at ${SETTINGS_URL})`);
}