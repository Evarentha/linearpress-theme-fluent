/*
 * Fluent Theme Appearance Configuration
 *
 * Schema, defaults, form parsing, and CSS generation for theme appearance.
 *
 * Authors:
 * MoyuZJ <moyuzj@moyuzj.cn> @LinearTeam - Made in China with ♥
 *
 * Copyright (C) 2026 Evarentha
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Theme appearance configuration: schema, defaults, form parsing, and CSS
 * generation.
 * <p>The config lives in the plugin config store
 * (ctx.plugins.getConfig/setConfig('fluentui-theme')) and is edited visually
 * on the admin "Theme Appearance" page; site:locals reads it on each request
 * and injects the style overrides. All colors and sizes are sanitized to
 * prevent arbitrary CSS injection.</p>
 * @since 1.0.0
 */

export interface FluentThemeConfig {
  /** 首页眉题（站点名 eybrow）是否显示 */
  showEyebrow: boolean;
  /** 首页主标题（siteTitle）是否显示 */
  showSiteTitle: boolean;
  /** 首页副标题（siteSubtitle）是否显示 */
  showSiteSubtitle: boolean;
  /** 主标题字号 px（12-96） */
  heroTitleSize: number;
  /** 副标题字号 px（12-96） */
  heroSubtitleSize: number;
  /** 浅色模式品牌色（6 位 hex） */
  accentColor: string;
  /** 深色模式品牌色（6 位 hex） */
  darkAccentColor: string;
}

export const FLUENT_THEME_DEFAULTS: FluentThemeConfig = {
  showEyebrow: true,
  showSiteTitle: true,
  showSiteSubtitle: true,
  heroTitleSize: 32,
  heroSubtitleSize: 16,
  accentColor: '#0f6cbd',
  darkAccentColor: '#479ef5',
};

export const HERO_TITLE_SIZE_OPTIONS = [24, 28, 32, 36, 40, 48] as const;
export const HERO_SUBTITLE_SIZE_OPTIONS = [12, 14, 16, 18, 20] as const;

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

function boolOf(value: unknown): boolean {
  return value === 'on' || value === 'true' || value === true || value === 1 || value === '1';
}

function sizeOf(value: unknown, fallback: number): number {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return fallback;
  return Math.min(96, Math.max(12, n));
}

function colorOf(value: unknown, fallback: string): string {
  const raw = String(value ?? '').trim();
  return HEX_COLOR.test(raw) ? raw.toLowerCase() : fallback;
}

export function normalizeThemeConfig(raw?: unknown): FluentThemeConfig {
  const input = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  return {
    showEyebrow: boolOf(input.showEyebrow ?? FLUENT_THEME_DEFAULTS.showEyebrow),
    showSiteTitle: boolOf(input.showSiteTitle ?? FLUENT_THEME_DEFAULTS.showSiteTitle),
    showSiteSubtitle: boolOf(input.showSiteSubtitle ?? FLUENT_THEME_DEFAULTS.showSiteSubtitle),
    heroTitleSize: sizeOf(input.heroTitleSize, FLUENT_THEME_DEFAULTS.heroTitleSize),
    heroSubtitleSize: sizeOf(input.heroSubtitleSize, FLUENT_THEME_DEFAULTS.heroSubtitleSize),
    accentColor: colorOf(input.accentColor, FLUENT_THEME_DEFAULTS.accentColor),
    darkAccentColor: colorOf(input.darkAccentColor, FLUENT_THEME_DEFAULTS.darkAccentColor),
  };
}

/** 从表单 body 解析配置（开关由前端同步到隐藏字段，值为 'on'/'off'）。 */
export function themeConfigFromForm(body: Record<string, unknown>): FluentThemeConfig {
  const current = normalizeThemeConfig(body); // 先按通用规则清洗
  // 隐藏字段显式携带 'off' 时覆盖默认 true 语义
  const pick = (key: 'showEyebrow' | 'showSiteTitle' | 'showSiteSubtitle'): boolean => {
    const raw = body[key];
    if (raw === 'on' || raw === true || raw === 'true') return true;
    if (raw === 'off' || raw === false || raw === 'false') return false;
    return current[key];
  };
  return {
    ...current,
    showEyebrow: pick('showEyebrow'),
    showSiteTitle: pick('showSiteTitle'),
    showSiteSubtitle: pick('showSiteSubtitle'),
  };
}

/**
 * 生成注入到布局 <head> 的样式覆盖。
 * - 尺寸：--fluent-hero-* 变量（前台 CSS 在其上读取）
 * - 颜色：覆盖 Fluent 品牌令牌（组件与主题共用一个 :root 作用域），
 *   hover/pressed 等衍生色用 color-mix 从主色推导，避免写死衍生值。
 */
export function buildThemeCss(config: FluentThemeConfig): string {
  const mix = (base: string, target: string, percent: number) =>
    `color-mix(in srgb, ${base} ${percent}%, ${target})`;
  const light = config.accentColor;
  const la = (pct: number) => mix(light, 'black', pct);  // 加深
  const lb = (pct: number) => mix(light, 'white', pct);  // 提亮
  const dark = config.darkAccentColor;
  const da = (pct: number) => mix(dark, 'white', pct);   // 提亮
  const db = (pct: number) => mix(dark, 'black', pct);   // 加深

  const lightBlock = [
    `--fluent-hero-title-size:${config.heroTitleSize}px`,
    `--fluent-hero-subtitle-size:${config.heroSubtitleSize}px`,
    `--colorBrandBackground:${light}`,
    `--colorBrandBackgroundHover:${la(88)}`,
    `--colorBrandBackgroundPressed:${la(74)}`,
    `--colorBrandBackgroundSelected:${la(88)}`,
    `--colorBrandBackgroundStatic:${light}`,
    `--colorBrandBackground2:${la(82)}`,
    `--colorBrandForeground1:${light}`,
    `--colorBrandForeground1Hover:${la(82)}`,
    `--colorBrandForeground1Pressed:${la(70)}`,
    `--colorBrandForeground1Selected:${la(82)}`,
    `--colorBrandForeground2:${la(80)}`,
    `--colorBrandForeground2Hover:${la(68)}`,
    `--colorBrandForeground2Pressed:${la(55)}`,
    `--colorBrandForeground2Selected:${la(80)}`,
    `--colorBrandForegroundLink:${la(80)}`,
    `--colorBrandForegroundLinkHover:${la(68)}`,
    `--colorBrandForegroundLinkPressed:${la(55)}`,
    `--colorBrandForegroundLinkSelected:${la(80)}`,
    `--colorCompoundBrandForeground1:${light}`,
    `--colorCompoundBrandForeground1Hover:${la(82)}`,
    `--colorCompoundBrandForeground1Pressed:${la(70)}`,
    `--colorCompoundBrandBackground:${light}`,
    `--colorCompoundBrandBackgroundHover:${la(88)}`,
    `--colorCompoundBrandBackgroundPressed:${la(74)}`,
    `--colorCompoundBrandBackgroundSelected:${la(88)}`,
    `--colorBrandStroke1:${la(88)}`,
    `--colorBrandStroke2:${lb(62)}`,
    `--colorCompoundBrandStroke:${light}`,
    `--colorCompoundBrandStrokeHover:${la(82)}`,
    `--colorCompoundBrandStrokePressed:${la(70)}`,
  ].join(';');

  const darkBlock = [
    `--colorBrandBackground:${dark}`,
    `--colorBrandBackgroundHover:${da(88)}`,
    `--colorBrandBackgroundPressed:${db(85)}`,
    `--colorBrandBackgroundSelected:${da(88)}`,
    `--colorBrandBackgroundStatic:${light}`,
    `--colorBrandBackground2:${da(85)}`,
    `--colorBrandForeground1:${dark}`,
    `--colorBrandForeground1Hover:${da(88)}`,
    `--colorBrandForeground1Pressed:${db(85)}`,
    `--colorBrandForeground1Selected:${da(88)}`,
    `--colorBrandForeground2:${da(85)}`,
    `--colorBrandForeground2Hover:${da(72)}`,
    `--colorBrandForeground2Pressed:${da(55)}`,
    `--colorBrandForeground2Selected:${da(85)}`,
    `--colorBrandForegroundLink:${da(85)}`,
    `--colorBrandForegroundLinkHover:${da(72)}`,
    `--colorBrandForegroundLinkPressed:${da(55)}`,
    `--colorBrandForegroundLinkSelected:${da(85)}`,
    `--colorCompoundBrandForeground1:${dark}`,
    `--colorCompoundBrandForeground1Hover:${da(88)}`,
    `--colorCompoundBrandForeground1Pressed:${db(85)}`,
    `--colorCompoundBrandBackground:${dark}`,
    `--colorCompoundBrandBackgroundHover:${da(88)}`,
    `--colorCompoundBrandBackgroundPressed:${db(85)}`,
    `--colorCompoundBrandBackgroundSelected:${da(88)}`,
    `--colorBrandStroke1:${da(88)}`,
    `--colorBrandStroke2:${db(65)}`,
    `--colorCompoundBrandStroke:${dark}`,
    `--colorCompoundBrandStrokeHover:${da(88)}`,
    `--colorCompoundBrandStrokePressed:${db(85)}`,
  ].join(';');

  return `:root{${lightBlock}} :root[data-theme="dark"]{${darkBlock}}`;
}