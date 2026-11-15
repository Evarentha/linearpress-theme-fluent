/*
 * Fluent Theme Motion
 *
 * The TabList selection indicator slides from the previously selected tab, within a page and across page loads.
 *
 * Authors:
 * MoyuZJ <moyuzj@evarentha.com> @LinearTeam - Made in China with ♥
 * worryzu <worryzu@evarentha.com> @LinearTeam
 *
 * Copyright (C) 2026 Evarentha
 * SPDX-License-Identifier: GPL-3.0-or-later
 */

/*
  Same technique as Fluent UI's useTabAnimatedIndicator: place the new
  indicator at the old tab's offset and width (translateX + scaleX from the
  left), then release it so the CSS transition (durationSlow,
  curveDecelerateMax) carries it home. Tabs that are links reload the page,
  so the old position is kept in sessionStorage for a few seconds.
  @since 4.0.0
*/
(() => {
  const KEY = 'fluent-tab-from';
  const INSET = 24; // the indicator is inset 12px on both sides
  const calm = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const tabsOf = (list) => [...list.children].filter((el) => el.matches('a, button'));
  const selectedOf = (list) => tabsOf(list).find((el) => el.getAttribute('aria-current') === 'page' || el.getAttribute('aria-selected') === 'true');
  const signature = (list) => tabsOf(list).map((el) => el.getAttribute('href') || el.textContent.trim()).join('|');
  const horizontal = (list) => getComputedStyle(list).flexDirection !== 'column';
  const rectOf = (tab, list) => { const a = tab.getBoundingClientRect(); const b = list.getBoundingClientRect(); return { x: a.left - b.left, w: a.width }; };

  const slide = (list, tab, from) => {
    if (!from || calm() || !horizontal(list)) return;
    const to = rectOf(tab, list);
    const offset = from.x - to.x;
    const scale = Math.max(0.05, (from.w - INSET) / Math.max(1, to.w - INSET));
    if (Math.abs(offset) < 1 && Math.abs(scale - 1) < 0.01) return;
    tab.classList.remove('f-ind-animate');
    tab.style.setProperty('--f-ind-offset', `${offset}px`);
    tab.style.setProperty('--f-ind-scale', String(scale));
    tab.getBoundingClientRect(); // commit the start position before enabling the transition
    requestAnimationFrame(() => {
      tab.classList.add('f-ind-animate');
      tab.style.setProperty('--f-ind-offset', '0px');
      tab.style.setProperty('--f-ind-scale', '1');
      tab.addEventListener('transitionend', () => tab.classList.remove('f-ind-animate'), { once: true });
    });
  };

  const lists = [...document.querySelectorAll('.tabs')];
  if (!lists.length) return;

  // Across a page load: animate from where the indicator was when the link was clicked.
  let stored = null;
  try { stored = JSON.parse(sessionStorage.getItem(KEY) || 'null'); sessionStorage.removeItem(KEY); } catch { /* storage blocked */ }
  if (stored && Date.now() - stored.at < 4000) {
    const list = lists.find((item) => signature(item) === stored.signature);
    const tab = list && selectedOf(list);
    if (tab) slide(list, tab, stored.from);
  }
  document.addEventListener('click', (event) => {
    const link = event.target.closest('.tabs > a[href]');
    if (!link || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || link.target === '_blank') return;
    const list = link.parentElement;
    const current = selectedOf(list);
    if (!current || current === link) return;
    try { sessionStorage.setItem(KEY, JSON.stringify({ at: Date.now(), signature: signature(list), from: rectOf(current, list) })); } catch { /* storage blocked */ }
  });

  // Within a page: tabs whose selection is switched by script.
  const last = new Map(lists.map((list) => { const tab = selectedOf(list); return [list, tab ? rectOf(tab, list) : null]; }));
  const observer = new MutationObserver((records) => {
    for (const record of records) {
      const tab = record.target;
      const list = tab.parentElement;
      if (!list || !last.has(list) || selectedOf(list) !== tab) continue;
      slide(list, tab, last.get(list));
      last.set(list, rectOf(tab, list));
    }
  });
  for (const list of lists) observer.observe(list, { subtree: true, attributes: true, attributeFilter: ['aria-selected', 'aria-current'] });
})();
