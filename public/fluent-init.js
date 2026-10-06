/*
 * Fluent Theme Runtime Initializer
 *
 * Shared Fluent initialization module (ESM) for the site and admin shells.
 *
 * Authors:
 * MoyuZJ <moyuzj@moyuzj.cn> @LinearTeam - Made in China with ♥
 * worryzu <worryzu@gmail.com> @LinearTeam
 *
 * Copyright (C) 2026 Evarentha
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/**
 * Fluent initialization module (ESM) shared by the front end and back end.
 * <p>Responsibilities:</p>
 * <ul>
 * <li>Guard-registers the Fluent Web Components in use (the bundle does not
 * define them on its own).</li>
 * <li>Dark mode: syncs the header fluent-switch state and reacts to storage
 * events.</li>
 * <li>Admin: the mobile drawer (burger/overlay/Escape/route-click
 * collapse).</li>
 * <li>Site: disables the comment form submit button while posting to prevent
 * duplicate submissions.</li>
 * </ul>
 * <p>Loaded as a module by the overridden layouts/web.ejs and
 * layouts/admin.ejs; must load after the vendor bundle.</p>
 * @since 1.0.0
 */

import {
  Accordion, AccordionDefinition,
  AccordionItem, AccordionItemDefinition,
  Avatar, AvatarDefinition,
  Badge, BadgeDefinition,
  Button, ButtonDefinition,
  Checkbox, CheckboxDefinition,
  Divider, DividerDefinition,
  Dropdown, DropdownDefinition,
  DropdownOption, DropdownOptionDefinition,
  Field, FieldDefinition,
  Link, LinkDefinition,
  MessageBar, MessageBarDefinition,
  ProgressBar, ProgressBarDefinition,
  Spinner, SpinnerDefinition,
  Switch, SwitchDefinition,
  TextArea, TextAreaDefinition,
  TextInput, TextInputDefinition,
  Tooltip, TooltipDefinition,
} from '/plugins/fluentui-theme/vendor/web-components-all.min.js';

/* ---------------------------------------------------------- 守卫注册 */
const DEFINITIONS = [
  [Accordion, AccordionDefinition],
  [AccordionItem, AccordionItemDefinition],
  [Avatar, AvatarDefinition],
  [Badge, BadgeDefinition],
  [Button, ButtonDefinition],
  [Checkbox, CheckboxDefinition],
  [Divider, DividerDefinition],
  [Dropdown, DropdownDefinition],
  [DropdownOption, DropdownOptionDefinition],
  [Field, FieldDefinition],
  [Link, LinkDefinition],
  [MessageBar, MessageBarDefinition],
  [ProgressBar, ProgressBarDefinition],
  [Spinner, SpinnerDefinition],
  [Switch, SwitchDefinition],
  [TextArea, TextAreaDefinition],
  [TextInput, TextInputDefinition],
  [Tooltip, TooltipDefinition],
];

for (const [elementClass, definition] of DEFINITIONS) {
  if (!elementClass) continue;
  if (!definition || !definition.name) continue;
  if (!customElements.get(definition.name)) {
    try { elementClass.define(definition); }
    catch (error) { console.warn('[fluent] define 失败', definition.name, error); }
  }
}

/* ---------------------------------------------------------- 表单初始值 */
// This vendor's textarea value is a property, not a reflected HTML attribute.
// Explicitly hydrate the server-escaped initial value after custom-element upgrade;
// setting the property also updates the shadow textarea and form-associated value.
document.querySelectorAll('fluent-textarea[value]').forEach((area) => {
  if (area.hasAttribute('data-fluent-initialized')) return;
  let edited = false;
  const onInput = () => { edited = true; };
  area.addEventListener('input', onInput);
  // define() schedules registration in this bundle. Assigning before upgrade
  // creates an own property that FAST subsequently resets to its empty default.
  customElements.whenDefined('fluent-textarea').then(() => {
    customElements.upgrade(area);
    // FAST initializes from its slot in a queued animation frame, overwriting
    // earlier assignments. Wait for that first render and never overwrite edits.
    requestAnimationFrame(() => requestAnimationFrame(() => {
      if (!edited && !area.value && !area.hasAttribute('data-fluent-initialized')) {
        area.defaultValue = area.getAttribute('value') ?? '';
        area.value = area.defaultValue;
      }
      area.setAttribute('data-fluent-initialized', '');
      area.removeEventListener('input', onInput);
    }));
  });
});

/* ---------------------------------------------------------- 深色模式 */
const THEME_KEY = 'fluent-theme';
const root = document.documentElement;

function resolveTheme() {
  const stored = (() => { try { return localStorage.getItem(THEME_KEY); } catch { return null; } })();
  if (stored === 'light' || stored === 'dark') return stored;
  try { return window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'; } catch { return 'light'; }
}

function applyTheme(theme) {
  root.dataset.theme = theme;
  document.querySelectorAll('[data-fluent-theme-toggle]').forEach((el) => { el.checked = theme === 'dark'; });
  try { localStorage.setItem(THEME_KEY, theme); } catch { /* 隐私模式忽略 */ }
}

const toggles = document.querySelectorAll('[data-fluent-theme-toggle]');
toggles.forEach((el) => {
  el.addEventListener('change', () => applyTheme(el.checked ? 'dark' : 'light'));
});
applyTheme(resolveTheme()); // 同步首屏内联脚本设置的状态到控件

window.addEventListener('storage', (event) => {
  if (event.key === THEME_KEY) applyTheme(event.newValue === 'dark' ? 'dark' : 'light');
});

/* ---------------------------------------------------------- 后台抽屉 */
if (document.body.classList.contains('fluent-admin')) {
  const burger = document.getElementById('adminBurger');
  const drawer = document.querySelector('.admin-side');
  const overlay = document.getElementById('adminOverlay');
  if (burger && drawer && overlay) {
    const setOpen = (open) => {
      drawer.classList.toggle('admin-side-open', open);
      overlay.setAttribute('data-open', open ? 'true' : 'false');
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? '收起导航菜单' : '打开导航菜单');
    };
    burger.addEventListener('click', (event) => { event.stopPropagation(); setOpen(!drawer.classList.contains('admin-side-open')); });
    overlay.addEventListener('click', () => setOpen(false));
    drawer.addEventListener('click', (event) => { if (event.target.closest('a')) setOpen(false); });
    document.addEventListener('keydown', (event) => { if (event.key === 'Escape') setOpen(false); });
    // 导航分组（带子菜单的父项点击展开/收起）
    document.querySelectorAll('[data-admin-group]').forEach((group) => {
      const children = group.querySelector('.admin-nav-children');
      const parent = group.querySelector('.admin-nav-parent');
      if (!children || !parent) return;
      parent.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); children.classList.toggle('is-open'); });
    });
  }
}

/* ---------------------------------------------------------- 前台评论表单 */
const commentForm = document.querySelector('.f-comment-form');
if (commentForm) {
  commentForm.addEventListener('submit', () => {
    const button = commentForm.querySelector('[type="submit"]');
    if (button) button.disabled = true;
  });
  const area = commentForm.querySelector('fluent-textarea');
  if (area) {
    const control = area;
    const sync = () => {
      const counter = commentForm.querySelector('.f-char-count');
      if (counter) counter.textContent = String(control.value?.length ?? 0);
    };
    control.addEventListener('input', sync);
    sync();
  }
}

/* ---------------------------------------------------------- 滚动条美化（前台） */
if (!document.body.classList.contains('fluent-admin')) {
  // Fluent 风格的细滚动条，仅在支持时生效
  try {
    if ('CSS' in window && CSS.supports('::-webkit-scrollbar', 'thin')) {
      document.documentElement.classList.add('fluent-scrollbars');
    }
  } catch { /* 忽略 */ }
}