/*
 * Fluent Theme Settings
 *
 * Live preview of the brand color: the ramp is rebuilt in the browser and applied to the whole page before saving.
 *
 * Authors:
 * MoyuZJ <moyuzj@evarentha.com> @LinearTeam - Made in China with ♥
 * worryzu <worryzu@evarentha.com> @LinearTeam
 *
 * Copyright (C) 2026 Evarentha
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
(() => {
  const form = document.querySelector('[data-fluent-brand]');
  if (!form) return;
  const DEFAULT = '#0f6cbd';
  const STEPS = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160];
  const WEB = ['#061724', '#082338', '#0a2e4a', '#0c3b5e', '#0e4775', '#0f548c', '#115ea3', '#0f6cbd', '#2886de', '#479ef5', '#62abf5', '#77b7f7', '#96c6fa', '#b4d6fa', '#cfe4fa', '#ebf3fc'];
  // Must match src/config.ts.
  const SHAPE = { 10: [0.74, 0.32], 20: [0.64, 0.45], 30: [0.54, 0.58], 40: [0.42, 0.7], 50: [0.3, 0.8], 60: [0.2, 0.9], 70: [0.1, 0.98], 80: [0, 1], 90: [0.12, 1], 100: [0.26, 1], 110: [0.36, 0.9], 120: [0.44, 0.8], 130: [0.56, 0.65], 140: [0.68, 0.5], 150: [0.8, 0.32], 160: [0.92, 0.12] };
  const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
  const toGamma = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
  const toOklch = (hex) => {
    const [r, g, b] = [1, 3, 5].map((i) => toLinear(parseInt(hex.slice(i, i + 2), 16) / 255));
    const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
    const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
    const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
    const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
    const A = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
    const B = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
    return [L, Math.hypot(A, B), Math.atan2(B, A)];
  };
  const toRgb = (L, C, h) => {
    const A = C * Math.cos(h); const B = C * Math.sin(h);
    const l = (L + 0.3963377774 * A + 0.2158037573 * B) ** 3;
    const m = (L - 0.1055613458 * A - 0.0638541728 * B) ** 3;
    const s = (L - 0.0894841775 * A - 1.291485548 * B) ** 3;
    return [4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s, -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s, -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s];
  };
  const toHex = (L, C, h) => {
    let chroma = C; let rgb = toRgb(L, chroma, h);
    while (rgb.some((v) => v < -0.0005 || v > 1.0005) && chroma > 0.001) { chroma *= 0.95; rgb = toRgb(L, chroma, h); }
    return `#${rgb.map((v) => Math.round(Math.min(1, Math.max(0, toGamma(Math.min(1, Math.max(0, v))))) * 255).toString(16).padStart(2, '0')).join('')}`;
  };
  const ramp = (brand) => {
    if (brand === DEFAULT) return WEB;
    const [L, C, h] = toOklch(brand);
    return STEPS.map((step) => {
      if (step === 80) return brand;
      const [move, chroma] = SHAPE[step];
      return toHex(step > 80 ? L + (0.975 - L) * move : L * (1 - move), C * chroma, h);
    });
  };

  const root = document.documentElement;
  const custom = form.querySelector('input[name="custom_brand"]');
  const customHex = form.querySelector('[data-fluent-custom-hex]');
  const cells = [...form.querySelectorAll('[data-fluent-ramp] span')];
  const chosen = () => {
    const value = form.querySelector('input[name="brand"]:checked')?.value;
    return value === 'custom' ? custom.value.toLowerCase() : value || DEFAULT;
  };
  const apply = () => {
    const colors = ramp(chosen());
    STEPS.forEach((step, i) => { root.style.setProperty(`--f-brand-${step}`, colors[i]); if (cells[i]) { cells[i].style.background = colors[i]; cells[i].title = `${step} · ${colors[i]}`; } });
  };
  form.addEventListener('change', apply);
  custom.addEventListener('input', () => { form.querySelector('input[name="brand"][value="custom"]').checked = true; customHex.textContent = custom.value.toLowerCase(); apply(); });
  custom.addEventListener('click', () => { form.querySelector('input[name="brand"][value="custom"]').checked = true; });
  form.querySelector('[data-fluent-reset]')?.addEventListener('click', (event) => {
    const preset = form.querySelector(`input[name="brand"][value="${event.currentTarget.dataset.fluentReset}"]`);
    if (preset) { preset.checked = true; apply(); form.dispatchEvent(new Event('input', { bubbles: true })); }
  });
  form.querySelectorAll('[data-fluent-noop]').forEach((link) => link.addEventListener('click', (event) => event.preventDefault()));
})();
