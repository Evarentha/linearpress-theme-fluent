/*
 * Author: MoyuZJ
 * Team: LinearTeam
 * Contact: linearteam@foxmail.com
 * Made by MoyuZJ in China with ♥
 */

/*
 * fluentui-theme —— LinearPress 的 Fluent 2 主题插件。
 *
 * 职责边界（与 Cordis 生命周期对应）：
 *  1. 视图覆盖：通过 web.viewDir() 在 activate 阶段注册视图目录
 *     （排在 Express views 搜索顺序最前，覆盖核心与其它插件），
 *     plugin.json 刻意不声明 views 字段。
 *  2. 路由：/archive 归档页；/admin/fluentui-theme/settings 主题外观设置页。
 *  3. hooks：site:locals 注入模板辅助（归档分组）与主题外观配置（含 CSS 覆盖）。
 *  4. 静态资源：Fluent Web Components 全量 bundle 在 public/vendor，
 *     由覆盖后的布局以 <script type="module"> 引入（ESM）。
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