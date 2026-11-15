/*
 * Fluent Theme Configuration
 *
 * The brand color setting and the 16-step Fluent brand ramp generated from it.
 *
 * Authors:
 * MoyuZJ <moyuzj@evarentha.com> @LinearTeam - Made in China with ♥
 * worryzu <worryzu@evarentha.com> @LinearTeam
 *
 * Copyright (C) 2026 Evarentha
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * <p>Fluent themes are driven by a brand ramp (10 = darkest … 160 =
 * lightest, 80 = the brand color itself); light mode uses 80/70/40 for
 * fills and 160 for tints, dark mode 70/100/110 and 20. The default is
 * Microsoft's web ramp, kept exact. A custom color is placed at step 80 and
 * the other steps are derived in OKLCH: lighter steps raise lightness while
 * holding chroma for the mid tones (as the Fluent ramp does), darker steps
 * lower both. The same algorithm runs in the settings page for the live
 * preview (public/fluent-settings.js).</p>
 *
 * @since 4.0.0
 */

export interface FluentConfig { brand: string; }
export const DEFAULT_BRAND = '#0f6cbd';
export const DEFAULTS: FluentConfig = { brand: DEFAULT_BRAND };
export const PRESETS = [
  { label: 'Fluent 蓝', color: '#0f6cbd' },
  { label: '靛紫', color: '#5b5fc7' },
  { label: '青绿', color: '#03787c' },
  { label: '森绿', color: '#107c10' },
  { label: '暖橙', color: '#c43e1c' },
  { label: '矢车菊', color: '#4f6bed' }
] as const;

export const STEPS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160] as const;
const WEB_RAMP: Record<number, string> = {
  10: '#061724', 20: '#082338', 30: '#0a2e4a', 40: '#0c3b5e', 50: '#0e4775', 60: '#0f548c', 70: '#115ea3', 80: '#0f6cbd',
  90: '#2886de', 100: '#479ef5', 110: '#62abf5', 120: '#77b7f7', 130: '#96c6fa', 140: '#b4d6fa', 150: '#cfe4fa', 160: '#ebf3fc'
};
/** step → [lightness move (toward white for >80, toward black for <80), chroma factor] */
const SHAPE: Record<number, [number, number]> = {
  10: [0.74, 0.32], 20: [0.64, 0.45], 30: [0.54, 0.58], 40: [0.42, 0.7], 50: [0.3, 0.8], 60: [0.2, 0.9], 70: [0.1, 0.98], 80: [0, 1],
  90: [0.12, 1], 100: [0.26, 1], 110: [0.36, 0.9], 120: [0.44, 0.8], 130: [0.56, 0.65], 140: [0.68, 0.5], 150: [0.8, 0.32], 160: [0.92, 0.12]
};

const HEX = /^#[0-9a-f]{6}$/;
export function normalizeConfig(raw: unknown): FluentConfig {
  const input = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const brand = String(input.brand ?? input.accentColor ?? '').trim().toLowerCase();
  return { brand: HEX.test(brand) ? brand : DEFAULT_BRAND };
}

/* ---------- color math (sRGB ⇄ OKLab) ---------- */
const toLinear = (c: number) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const toGamma = (c: number) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
function hexToOklch(hex: string): [number, number, number] {
  const [r, g, b] = [1, 3, 5].map((i) => toLinear(parseInt(hex.slice(i, i + 2), 16) / 255));
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  return [L, Math.hypot(A, B), Math.atan2(B, A)];
}
function oklchToRgb(L: number, C: number, h: number): [number, number, number] {
  const A = C * Math.cos(h); const B = C * Math.sin(h);
  const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
  const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
  const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
  return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
}
function oklchToHex(L: number, C: number, h: number): string {
  let chroma = C;
  let rgb = oklchToRgb(L, chroma, h);
  // Reduce chroma until the color fits in sRGB.
  while (rgb.some((v) => v < -0.0005 || v > 1.0005) && chroma > 0.001) { chroma *= 0.95; rgb = oklchToRgb(L, chroma, h); }
  return `#${rgb.map((v) => Math.round(Math.min(1, Math.max(0, toGamma(Math.min(1, Math.max(0, v))))) * 255).toString(16).padStart(2, '0')).join('')}`;
}

export function brandRamp(brand: string): Record<number, string> {
  if (brand === DEFAULT_BRAND || !HEX.test(brand)) return { ...WEB_RAMP };
  const [L, C, h] = hexToOklch(brand);
  const ramp: Record<number, string> = {};
  for (const step of STEPS) {
    const [move, chroma] = SHAPE[step];
    if (step === 80) { ramp[step] = brand; continue; }
    const lightness = step > 80 ? L + (0.975 - L) * move : L * (1 - move);
    ramp[step] = oklchToHex(lightness, C * chroma, h);
  }
  return ramp;
}

/** The <style> that replaces the default ramp, or '' for the default brand. */
export function brandStyle(config: FluentConfig): string {
  if (config.brand === DEFAULT_BRAND) return '';
  const ramp = brandRamp(config.brand);
  return `<style id="fluent-brand">:root{${STEPS.map((step) => `--f-brand-${step}:${ramp[step]}`).join(';')}}</style>`;
}
