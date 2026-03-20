import { selectTool } from '../core/toolkit.js';

const ELEMENT_OPTIONS = [
  { label: 'Accordion', value: 'accordion' },
  { label: 'Alerts', value: 'alert' },
  { label: 'Badge', value: 'badge' },
  { label: 'Breadcrumb', value: 'breadcrumb' },
  { label: 'Buttons', value: 'button' },
  { label: 'Button group', value: 'button-group' },
  { label: 'Card', value: 'card' },
  { label: 'Dropdowns', value: 'dropdown' },
];

const VARIANT_OPTIONS = [
  { label: 'Primary', value: 'primary' },
  { label: 'Secondary', value: 'secondary' },
  { label: 'Success', value: 'success' },
  { label: 'Danger', value: 'danger' },
  { label: 'Warning', value: 'warning' },
  { label: 'Info', value: 'info' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

function esc(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function uid(prefix = 'mnb-el') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function clampCount(value, fallback = 3) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(12, Math.round(n)));
}

function capitalize(value = '') {
  const text = String(value || '');
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : '';
}

function htmlToElement(html) {
  const template = document.createElement('template');
  template.innerHTML = String(html).trim();
  return template.content.firstElementChild;
}

function tone(variant = 'primary') {
  const map = {
    primary: {
      bg: '#eef2ff',
      border: '#c7d2fe',
      text: '#3730a3',
      solid: '#4f46e5',
      solidText: '#ffffff',
    },
    secondary: {
      bg: '#f3f4f6',
      border: '#d1d5db',
      text: '#374151',
      solid: '#6b7280',
      solidText: '#ffffff',
    },
    success: {
      bg: '#ecfdf5',
      border: '#a7f3d0',
      text: '#065f46',
      solid: '#10b981',
      solidText: '#ffffff',
    },
    danger: {
      bg: '#fef2f2',
      border: '#fecaca',
      text: '#991b1b',
      solid: '#ef4444',
      solidText: '#ffffff',
    },
    warning: {
      bg: '#fffbeb',
      border: '#fde68a',
      text: '#92400e',
      solid: '#f59e0b',
      solidText: '#111827',
    },
    info: {
      bg: '#eff6ff',
      border: '#bfdbfe',
      text: '#1d4ed8',
      solid: '#3b82f6',
      solidText: '#ffffff',
    },
    light: {
      bg: '#ffffff',
      border: '#e5e7eb',
      text: '#374151',
      solid: '#f3f4f6',
      solidText: '#111827',
    },
    dark: {
      bg: '#111827',
      border: '#374151',
      text: '#f9fafb',
      solid: '#111827',
      solidText: '#ffffff',
    },
  };

  return map[variant] || map.primary;
}

function normalizeVariantList(variants) {
  if (Array.isArray(variants) && variants.length) return variants;
  if (typeof variants === 'string' && variants) return [variants];
  return ['primary'];
}

function variantAt(variants, index = 0) {
  const list = normalizeVariantList(variants);
  return list[index % list.length] || 'primary';
}

function titleFor(type) {
  return ELEMENT_OPTIONS.find((item) => item.value === type)?.label || 'Element';
}

function wrap(type, inner) {
  return `
    <div data-mnb-element="${esc(type)}" data-mnb-element-id="${esc(uid('mnb-el'))}" style="margin:12px 0;">
      ${inner}
    </div>
    <p data-mnb-after-element="true"><br></p>
  `;
}

function buttonHtml(label, variant) {
  const t = tone(variant);
  return `
    <a
      href="#"
      style="
        display:inline-flex;
        align-items:center;
        justify-content:center;
        padding:10px 16px;
        border-radius:12px;
        background:${t.solid};
        color:${t.solidText};
        border:1px solid ${t.solid};
        text-decoration:none;
        font-weight:700;
        line-height:1.2;
      "
    >${esc(label)}</a>
  `;
}

function ensureAfterBlock(editor, block) {
  if (!block || !block.parentNode) return;

  const next = block.nextElementSibling;
  const alreadyHasAfterParagraph =
    next &&
    next.matches &&
    next.matches('p[data-mnb-after-element], p');

  if (alreadyHasAfterParagraph) return;

  const paragraph = document.createElement('p');
  paragraph.setAttribute('data-mnb-after-element', 'true');
  paragraph.innerHTML = '<br>';
  block.insertAdjacentElement('afterend', paragraph);
}

function placeCaretAtEnd(editor, node) {
  if (!node) return;

  const target = node.querySelector?.('[data-mnb-accordion-tail="true"]') || node;
  const range = document.createRange();
  range.selectNodeContents(target);
  range.collapse(false);

  const selection = window.getSelection();
  if (!selection) return;

  selection.removeAllRanges();
  selection.addRange(range);
  editor.captureSelection(range);
  editor.focus(range);
}

function ensureAccordionTail(root) {
  if (!root) return null;

  const accordionRoot = root.querySelector('[data-mnb-accordion-root="true"]');
  if (!accordionRoot) return null;

  let tailWrap = accordionRoot.querySelector('[data-mnb-accordion-tail-wrap="true"]');
  if (tailWrap) return tailWrap;

  tailWrap = document.createElement('div');
  tailWrap.setAttribute('data-mnb-accordion-tail-wrap', 'true');
  tailWrap.style.marginTop = '12px';
  tailWrap.style.minHeight = '34px';
  tailWrap.style.borderRadius = '12px';
  tailWrap.style.padding = '6px 8px';
  tailWrap.style.cursor = 'text';

  const tail = document.createElement('p');
  tail.setAttribute('data-mnb-accordion-tail', 'true');
  tail.setAttribute('data-mnb-after-element', 'true');
  tail.style.margin = '0';
  tail.style.minHeight = '22px';
  tail.innerHTML = '<br>';

  tailWrap.appendChild(tail);
  accordionRoot.appendChild(tailWrap);
  return tailWrap;
}

function getAccordionItemHtml(index, variant, open = false) {
  const t = tone(variant);

  return `
    <details
      data-mnb-accordion-item="true"
      ${open ? 'open' : ''}
      style="
        border:1px solid ${t.border};
        border-radius:18px;
        background:#ffffff;
        overflow:hidden;
        box-shadow:0 8px 22px rgba(15,23,42,.04);
      "
    >
      <summary
        style="
          list-style:none;
          cursor:pointer;
          padding:0;
        "
      >
        <div
          style="
            display:flex;
            align-items:center;
            justify-content:space-between;
            gap:14px;
            padding:16px 18px;
            background:linear-gradient(180deg, #ffffff 0%, ${t.bg} 140%);
          "
        >
          <div style="display:flex;align-items:center;gap:14px;min-width:0;flex:1;">
            <span
              data-mnb-accordion-drag="true"
              title="Drag to reorder"
              style="
                width:32px;
                height:32px;
                border-radius:10px;
                display:inline-flex;
                align-items:center;
                justify-content:center;
                background:#ffffff;
                border:1px solid ${t.border};
                color:${t.text};
                font-size:14px;
                font-weight:900;
                flex:0 0 auto;
                cursor:grab;
                user-select:none;
              "
            >
              ⋮⋮
            </span>

            <span
              data-mnb-accordion-index="true"
              style="
                width:38px;
                height:38px;
                border-radius:12px;
                display:inline-flex;
                align-items:center;
                justify-content:center;
                background:${t.bg};
                border:1px solid ${t.border};
                color:${t.text};
                font-size:14px;
                font-weight:800;
                flex:0 0 auto;
              "
            >
              ${index}
            </span>

            <div style="min-width:0;">
              <div
                data-mnb-accordion-title="true"
                style="
                  color:#111827;
                  font-size:15px;
                  font-weight:800;
                  line-height:1.25;
                  margin-bottom:3px;
                "
              >
                ${esc(`${variant} accordion item ${index}`)}
              </div>

              <div
                style="
                  color:#6b7280;
                  font-size:12px;
                  line-height:1.35;
                  white-space:nowrap;
                  overflow:hidden;
                  text-overflow:ellipsis;
                "
              >
                Click to expand this section
              </div>
            </div>
          </div>

          <span
            style="
              width:34px;
              height:34px;
              border-radius:999px;
              display:inline-flex;
              align-items:center;
              justify-content:center;
              background:#ffffff;
              border:1px solid ${t.border};
              color:${t.text};
              font-size:16px;
              font-weight:900;
              flex:0 0 auto;
            "
          >
            +
          </span>
        </div>
      </summary>

      <div style="padding:0 18px 18px;">
        <div
          style="
            border-top:1px solid ${t.border};
            margin-bottom:14px;
          "
        ></div>

        <div
          data-mnb-accordion-content="true"
          style="
            border:1px solid ${t.border};
            background:${t.bg};
            border-radius:14px;
            padding:14px 15px;
            color:#374151;
            line-height:1.65;
            font-size:14px;
          "
        >
          ${esc(`Accordion content ${index}`)}
        </div>
      </div>
    </details>
  `;
}

function getCurrentAccordion(editor) {
  const block = editor.getSelectedBlock?.();
  const accordion = block?.closest?.('[data-mnb-element="accordion"]') || null;
  if (!accordion) return null;

  const itemsWrap = accordion.querySelector('[data-mnb-accordion-items]');
  if (!itemsWrap) return null;

  const selectedItem = block?.closest?.('[data-mnb-accordion-item]') || null;
  const root = accordion.querySelector('[data-mnb-accordion-root]');
  const variantsAttr = root?.getAttribute('data-mnb-accordion-variants') || '';
  const variants = variantsAttr
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

  return {
    block: accordion,
    itemsWrap,
    selectedItem,
    variant: root?.getAttribute('data-mnb-accordion-variant') || 'primary',
    variants: variants.length ? variants : [root?.getAttribute('data-mnb-accordion-variant') || 'primary'],
  };
}

function getAccordionItems(root) {
  if (!root) return [];
  return [...root.querySelectorAll('[data-mnb-accordion-item]')];
}

function syncAccordionNumbers(root, _variant) {
  const items = getAccordionItems(root);

  items.forEach((item, index) => {
    const itemNumber = index + 1;
    const number = item.querySelector('[data-mnb-accordion-index]');

    if (number) {
      number.textContent = String(itemNumber);
    }
  });

  const countBadge = root.querySelector('[data-mnb-accordion-count]');
  if (countBadge) {
    countBadge.textContent = `${items.length} items`;
  }
}

function addToExistingAccordion(editor, amount = 1) {
  const ctx = getCurrentAccordion(editor);
  if (!ctx) return false;

  ensureAccordionInteractions(editor);
  ensureAfterBlock(editor, ctx.block);
  ensureAccordionTail(ctx.block);

  const safeAmount = clampCount(amount, 1);
  const currentItems = getAccordionItems(ctx.block);
  const startIndex = currentItems.length + 1;
  const variantList = normalizeVariantList(ctx.variants);

  for (let i = 0; i < safeAmount; i += 1) {
    const itemIndex = startIndex + i;
    const itemVariant = variantAt(variantList, itemIndex - 1);
    const itemNode = htmlToElement(getAccordionItemHtml(itemIndex, itemVariant, false));
    ctx.itemsWrap.appendChild(itemNode);
  }

  syncAccordionNumbers(ctx.block, ctx.variant);
  editor.saveHistory('accordion-add-existing');
  editor.refreshStatus();
  editor.alert(`Added ${safeAmount} accordion item${safeAmount > 1 ? 's' : ''}.`, 'success');
  placeCaretAtEnd(editor, ctx.block);
  return true;
}

function removeFromExistingAccordion(editor, amount = 1) {
  const ctx = getCurrentAccordion(editor);
  if (!ctx) return false;

  ensureAfterBlock(editor, ctx.block);
  ensureAccordionTail(ctx.block);

  const items = getAccordionItems(ctx.block);
  if (items.length <= 1) {
    editor.alert('At least one accordion item must remain.', 'info');
    return false;
  }

  let toRemove = Math.min(clampCount(amount, 1), items.length - 1);
  let removed = 0;

  if (ctx.selectedItem && ctx.itemsWrap.contains(ctx.selectedItem) && toRemove > 0) {
    ctx.selectedItem.remove();
    removed += 1;
    toRemove -= 1;
  }

  while (toRemove > 0) {
    const currentItems = getAccordionItems(ctx.block);
    const last = currentItems[currentItems.length - 1];
    if (!last) break;
    last.remove();
    removed += 1;
    toRemove -= 1;
  }

  syncAccordionNumbers(ctx.block, ctx.variant);
  editor.saveHistory('accordion-remove-existing');
  editor.refreshStatus();
  editor.alert(`Removed ${removed} accordion item${removed > 1 ? 's' : ''}.`, 'success');
  placeCaretAtEnd(editor, ctx.block);
  return true;
}

function ensureAccordionInteractions(editor) {
  if (editor.__mnbAccordionInteractionsAttached) return;
  editor.__mnbAccordionInteractionsAttached = true;

  const surface = editor.surface;
  const dragState = {
    active: false,
    item: null,
    root: null,
    variant: 'primary',
    moved: false,
  };

  const clearVisuals = () => {
    if (!dragState.root) return;
    dragState.root.querySelectorAll('[data-mnb-accordion-item]').forEach((item) => {
      item.style.opacity = '';
      item.style.outline = '';
      item.style.outlineOffset = '';
    });
  };

  const finishDrag = () => {
    if (!dragState.active) return;

    clearVisuals();

    if (dragState.item) {
      dragState.item.style.opacity = '';
    }

    document.body.style.userSelect = '';

    if (dragState.root) {
      syncAccordionNumbers(dragState.root, dragState.variant);
      ensureAccordionTail(dragState.root);
      ensureAfterBlock(editor, dragState.root);
    }

    if (dragState.moved) {
      editor.saveHistory('accordion-reorder');
      editor.refreshStatus();
      editor.alert('Accordion reordered.', 'success');
    }

    dragState.active = false;
    dragState.item = null;
    dragState.root = null;
    dragState.variant = 'primary';
    dragState.moved = false;
  };

  surface.addEventListener('click', (event) => {
    const tailWrap = event.target.closest?.('[data-mnb-accordion-tail-wrap="true"]');
    if (tailWrap) {
      event.preventDefault();
      event.stopPropagation();
      placeCaretAtEnd(editor, tailWrap);
      return;
    }

    const handle = event.target.closest?.('[data-mnb-accordion-drag="true"]');
    if (handle) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  surface.addEventListener('mousedown', (event) => {
    const handle = event.target.closest?.('[data-mnb-accordion-drag="true"]');
    if (!handle) return;

    const item = handle.closest('[data-mnb-accordion-item]');
    const root = handle.closest('[data-mnb-element="accordion"]');
    if (!item || !root) return;

    event.preventDefault();
    event.stopPropagation();

    dragState.active = true;
    dragState.item = item;
    dragState.root = root;
    dragState.variant =
      root.querySelector('[data-mnb-accordion-root="true"]')?.getAttribute('data-mnb-accordion-variant') || 'primary';
    dragState.moved = false;

    item.style.opacity = '.6';
    document.body.style.userSelect = 'none';
  });

  surface.addEventListener('mousemove', (event) => {
    if (!dragState.active || !dragState.item || !dragState.root) return;

    const overRoot = event.target.closest?.('[data-mnb-element="accordion"]');
    if (!overRoot || overRoot !== dragState.root) return;

    const itemsWrap = dragState.root.querySelector('[data-mnb-accordion-items="true"]');
    if (!itemsWrap) return;

    clearVisuals();
    dragState.item.style.opacity = '.6';

    const overItem = event.target.closest?.('[data-mnb-accordion-item]');
    const overTail = event.target.closest?.('[data-mnb-accordion-tail-wrap="true"]');

    if (overItem && overItem !== dragState.item) {
      const rect = overItem.getBoundingClientRect();
      const before = event.clientY < rect.top + (rect.height / 2);

      overItem.style.outline = '2px solid #4f46e5';
      overItem.style.outlineOffset = '2px';

      if (before) {
        itemsWrap.insertBefore(dragState.item, overItem);
      } else {
        itemsWrap.insertBefore(dragState.item, overItem.nextSibling);
      }

      dragState.moved = true;
      syncAccordionNumbers(dragState.root, dragState.variant);
      return;
    }

    if (overTail) {
      itemsWrap.appendChild(dragState.item);
      dragState.moved = true;
      syncAccordionNumbers(dragState.root, dragState.variant);
    }
  });

  document.addEventListener('mouseup', finishDrag);
  window.addEventListener('blur', finishDrag);
}

function renderAccordion(count, variants) {
  const variantList = normalizeVariantList(variants);
  const rootVariant = variantAt(variantList, 0);
  const t = tone(rootVariant);

  return wrap(
    'accordion',
    `
      <div
        data-mnb-accordion-root="true"
        data-mnb-accordion-variant="${esc(rootVariant)}"
        data-mnb-accordion-variants="${esc(variantList.join(','))}"
        style="
          border:1px solid ${t.border};
          border-radius:22px;
          background:linear-gradient(180deg, ${t.bg} 0%, #ffffff 100%);
          padding:14px;
          box-shadow:0 14px 36px rgba(15,23,42,.06);
        "
      >
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding:4px 4px 14px;">
          <div>
            <div style="font-size:18px;font-weight:800;color:${t.text};line-height:1.2;">
              ${esc(`${capitalize(rootVariant)} accordion`)}
            </div>
            <div style="font-size:13px;color:#6b7280;margin-top:4px;">
              Expand sections to view content
            </div>
          </div>

          <span
            data-mnb-accordion-count="true"
            style="
              display:inline-flex;
              align-items:center;
              justify-content:center;
              min-width:78px;
              height:32px;
              padding:0 12px;
              border-radius:999px;
              background:${t.solid};
              color:${t.solidText};
              font-size:12px;
              font-weight:800;
              letter-spacing:.02em;
            "
          >
            ${count} items
          </span>
        </div>

        <div data-mnb-accordion-items="true" style="display:grid;gap:12px;">
          ${
            Array.from({ length: count }, (_, i) => {
              const itemVariant = variantAt(variantList, i);
              return getAccordionItemHtml(i + 1, itemVariant, i === 0);
            }).join('')
          }
        </div>

        <div
          data-mnb-accordion-tail-wrap="true"
          style="
            margin-top:12px;
            min-height:34px;
            border-radius:12px;
            padding:6px 8px;
            cursor:text;
          "
        >
          <p
            data-mnb-accordion-tail="true"
            data-mnb-after-element="true"
            style="margin:0;min-height:22px;"
          ><br></p>
        </div>
      </div>
    `
  );
}

function renderAlert(count, variants) {
  const variantList = normalizeVariantList(variants);

  return wrap(
    'alert',
    Array.from({ length: count }, (_, i) => {
      const variant = variantAt(variantList, i);
      const t = tone(variant);

      return `
        <div style="border:1px solid ${t.border};background:${t.bg};color:${t.text};padding:14px 16px;border-radius:14px;margin-bottom:10px;">
          <div style="font-weight:800;margin-bottom:6px;">${esc(`${variant} alert ${i + 1}`)}</div>
          <div>${esc(`This is ${variant} alert message ${i + 1}.`)}</div>
        </div>
      `;
    }).join('')
  );
}

function renderBadge(count, variants) {
  const variantList = normalizeVariantList(variants);

  return wrap(
    'badge',
    Array.from({ length: count }, (_, i) => {
      const variant = variantAt(variantList, i);
      const t = tone(variant);

      return `
        <span style="display:inline-flex;align-items:center;padding:6px 12px;border-radius:999px;border:1px solid ${t.border};background:${t.bg};color:${t.text};font-size:12px;font-weight:800;margin:0 10px 10px 0;">
          ${esc(`${variant} badge ${i + 1}`)}
        </span>
      `;
    }).join('')
  );
}

function renderBreadcrumb(count, variants) {
  const variantList = normalizeVariantList(variants);
  const rootVariant = variantAt(variantList, 0);
  const t = tone(rootVariant);
  const total = Math.max(2, count);

  const crumbs = Array.from({ length: total }, (_, i) => {
    const crumbVariant = variantAt(variantList, i);
    const ct = tone(crumbVariant);
    const last = i === total - 1;

    return `
      <span style="display:inline-flex;align-items:center;gap:10px;">
        ${
          last
            ? `<span style="color:${ct.text};font-weight:700;">${esc(`Item ${i + 1}`)}</span>`
            : `<a href="#" style="color:${ct.text};text-decoration:none;">${esc(`Item ${i + 1}`)}</a>`
        }
        ${!last ? '<span style="color:#9ca3af;">›</span>' : ''}
      </span>
    `;
  }).join('');

  return wrap(
    'breadcrumb',
    `
      <nav aria-label="Breadcrumb" style="display:flex;flex-wrap:wrap;gap:10px 6px;padding:12px 14px;border:1px solid ${t.border};border-radius:14px;background:#fff;">
        ${crumbs}
      </nav>
    `
  );
}

function renderButtons(count, variants) {
  const variantList = normalizeVariantList(variants);

  return wrap(
    'button',
    `<div style="display:flex;flex-wrap:wrap;gap:10px;">${
      Array.from({ length: count }, (_, i) => {
        const variant = variantAt(variantList, i);
        return buttonHtml(`${variant} button ${i + 1}`, variant);
      }).join('')
    }</div>`
  );
}

function renderButtonGroup(count, variants) {
  const variantList = normalizeVariantList(variants);

  return wrap(
    'button-group',
    `<div style="display:inline-flex;flex-wrap:wrap;gap:10px;">${
      Array.from({ length: count }, (_, i) => {
        const variant = variantAt(variantList, i);
        return buttonHtml(`Button ${i + 1}`, variant);
      }).join('')
    }</div>`
  );
}

function renderCard(count, variants) {
  const variantList = normalizeVariantList(variants);

  return wrap(
    'card',
    Array.from({ length: count }, (_, i) => {
      const variant = variantAt(variantList, i);
      const t = tone(variant);

      return `
        <div style="border:1px solid ${t.border};background:#fff;border-radius:18px;padding:18px;box-shadow:0 8px 24px rgba(15,23,42,.06);margin-bottom:12px;">
          <div style="font-size:18px;font-weight:800;color:#111827;margin-bottom:8px;">
            ${esc(`${variant} card ${i + 1}`)}
          </div>
          <div style="color:#4b5563;line-height:1.6;">
            ${esc(`Card content ${i + 1}`)}
          </div>
        </div>
      `;
    }).join('')
  );
}

function renderDropdown(count, variants) {
  const variantList = normalizeVariantList(variants);

  return wrap(
    'dropdown',
    Array.from({ length: count }, (_, i) => {
      const variant = variantAt(variantList, i);
      const t = tone(variant);

      return `
        <details style="display:inline-block;position:relative;margin:0 12px 12px 0;">
          <summary style="cursor:pointer;list-style:none;padding:10px 14px;border-radius:12px;background:${t.solid};color:${t.solidText};font-weight:700;">
            ${esc(`${variant} dropdown ${i + 1}`)}
          </summary>
          <div style="position:absolute;left:0;top:calc(100% + 10px);min-width:220px;background:#fff;border:1px solid #e5e7eb;border-radius:14px;box-shadow:0 14px 30px rgba(15,23,42,.12);padding:8px;z-index:5;">
            <a href="#" style="display:block;padding:10px 12px;border-radius:10px;color:#111827;text-decoration:none;">Action 1</a>
            <a href="#" style="display:block;padding:10px 12px;border-radius:10px;color:#111827;text-decoration:none;">Action 2</a>
            <a href="#" style="display:block;padding:10px 12px;border-radius:10px;color:#111827;text-decoration:none;">Action 3</a>
          </div>
        </details>
      `;
    }).join('')
  );
}

function renderByType(type, count, variants) {
  switch (type) {
    case 'accordion':
      return renderAccordion(count, variants);
    case 'alert':
      return renderAlert(count, variants);
    case 'badge':
      return renderBadge(count, variants);
    case 'breadcrumb':
      return renderBreadcrumb(count, variants);
    case 'button':
      return renderButtons(count, variants);
    case 'button-group':
      return renderButtonGroup(count, variants);
    case 'card':
      return renderCard(count, variants);
    case 'dropdown':
      return renderDropdown(count, variants);
    default:
      return renderCard(count, variants);
  }
}

function normalizePayload(value, fallbackType = 'accordion') {
  if (value && typeof value === 'object') {
    const validVariants = Array.isArray(value.variants)
      ? value.variants.filter((item) => VARIANT_OPTIONS.some((variant) => variant.value === item))
      : [];

    return {
      type: ELEMENT_OPTIONS.some((item) => item.value === value.type) ? value.type : fallbackType,
      count: clampCount(value.count, 3),
      variants: validVariants.length ? validVariants : ['primary'],
    };
  }

  return {
    type: ELEMENT_OPTIONS.some((item) => item.value === value) ? value : fallbackType,
    count: 1,
    variants: ['primary'],
  };
}

function variantChip(option, selected) {
  return `
    <button
      type="button"
      data-variant="${esc(option.value)}"
      style="
        padding:10px 12px;
        border-radius:12px;
        border:1px solid ${selected ? '#4f46e5' : '#d1d5db'};
        background:${selected ? '#eef2ff' : '#ffffff'};
        color:${selected ? '#3730a3' : '#374151'};
        font-weight:${selected ? '700' : '600'};
        cursor:pointer;
        text-align:left;
      "
    >
      ${esc(option.label)}
    </button>
  `;
}

export default selectTool({
  id: 'elements',
  label: 'Elements',
  icon: '▣',
  title: 'Elements',
  value: 'accordion',
  options: ELEMENT_OPTIONS,

  renderMenu(editor, ctx) {
    ensureAccordionInteractions(editor);

    const menu = ctx.menu;
    menu.style.padding = '0';
    menu.style.width = '560px';
    menu.style.maxWidth = '92vw';
    menu.style.maxHeight = 'calc(100vh - 24px)';
    menu.style.overflow = 'hidden';

    const layout = document.createElement('div');
    layout.style.display = 'grid';
    layout.style.gridTemplateColumns = '220px minmax(0,1fr)';
    layout.style.height = 'min(520px, calc(100vh - 48px))';
    layout.style.minHeight = '360px';

    const left = document.createElement('div');
    left.style.borderRight = '1px solid #e5e7eb';
    left.style.background = '#f8fafc';
    left.style.padding = '10px';
    left.style.overflow = 'auto';

    const right = document.createElement('div');
    right.style.padding = '16px';
    right.style.display = 'grid';
    right.style.gridTemplateRows = 'auto auto auto 1fr auto';
    right.style.minHeight = '0';
    right.style.overflow = 'auto';

    const state = {
      selectedType: this.value || 'accordion',
      hoverType: null,
      hoverTimer: null,
      count: 3,
      variants: new Set(['primary']),
    };

    const activeType = () => state.hoverType || state.selectedType;

    const setPreviewType = (type) => {
      if (state.hoverType === type) return;
      state.hoverType = type;
      renderLeft();
      renderRight();
    };

    const setSelectedType = (type) => {
      if (state.selectedType === type && state.hoverType == null) return;
      state.selectedType = type;
      state.hoverType = null;
      renderLeft();
      renderRight();
    };

    const clearHoverPreview = () => {
      clearTimeout(state.hoverTimer);
      state.hoverTimer = null;
      if (state.hoverType != null) {
        state.hoverType = null;
        renderLeft();
        renderRight();
      }
    };

    left.addEventListener('mouseleave', clearHoverPreview);

    const renderLeft = () => {
      const current = activeType();

      left.innerHTML = `
        <div style="font-size:12px;font-weight:800;letter-spacing:.06em;text-transform:uppercase;color:#6b7280;padding:6px 8px 10px;">
          Elements
        </div>
      `;

      ELEMENT_OPTIONS.forEach((item) => {
        const isSelected = state.selectedType === item.value;
        const isPreview = state.hoverType === item.value && state.selectedType !== item.value;
        const isActive = current === item.value;

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.style.width = '100%';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'space-between';
        btn.style.padding = '10px 12px';
        btn.style.border = '0';
        btn.style.borderRadius = '12px';
        btn.style.cursor = 'pointer';
        btn.style.marginBottom = '6px';
        btn.style.textAlign = 'left';
        btn.style.transition = 'all .15s ease';

        if (isSelected) {
          btn.style.background = '#4f46e5';
          btn.style.color = '#ffffff';
          btn.style.fontWeight = '800';
        } else if (isPreview || isActive) {
          btn.style.background = '#e0e7ff';
          btn.style.color = '#312e81';
          btn.style.fontWeight = '700';
        } else {
          btn.style.background = 'transparent';
          btn.style.color = '#111827';
          btn.style.fontWeight = '600';
        }

        btn.innerHTML = `
          <span>${esc(item.label)}</span>
          <span style="opacity:.7;">›</span>
        `;

        btn.addEventListener('mouseenter', () => {
          clearTimeout(state.hoverTimer);
          state.hoverTimer = setTimeout(() => {
            setPreviewType(item.value);
          }, 120);
        });

        btn.addEventListener('mouseleave', () => {
          clearTimeout(state.hoverTimer);
          state.hoverTimer = null;
        });

        btn.addEventListener('click', (event) => {
          event.preventDefault();
          clearTimeout(state.hoverTimer);
          state.hoverTimer = null;
          setSelectedType(item.value);
        });

        left.appendChild(btn);
      });
    };

    const renderRight = () => {
      const shownType = activeType();
      const heading = titleFor(shownType);
      const previewing = state.hoverType && state.hoverType !== state.selectedType;
      const selectedHeading = titleFor(state.selectedType);
      const existingAccordion = state.selectedType === 'accordion' ? getCurrentAccordion(editor) : null;
      const existingAccordionCount = existingAccordion ? getAccordionItems(existingAccordion.block).length : 0;

      right.innerHTML = `
        <div style="display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:14px;">
          <div>
            <div style="font-size:18px;font-weight:800;color:#111827;">${esc(heading)}</div>
            <div style="font-size:13px;color:#6b7280;margin-top:4px;">
              ${
                previewing
                  ? `Previewing ${esc(heading)}. Click it on the left to select before insert.`
                  : 'Choose count and variants, then insert.'
              }
            </div>
          </div>
        </div>

        <div style="margin-bottom:16px;">
          <label style="display:block;font-size:13px;font-weight:700;color:#374151;margin-bottom:8px;">
            No. of ${esc(heading)}
          </label>
          <input
            type="number"
            min="1"
            max="12"
            value="${esc(String(state.count))}"
            data-role="count"
            style="width:100%;padding:10px 12px;border:1px solid #d1d5db;border-radius:12px;font:inherit;"
          />
        </div>

        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:10px;">
          <label style="font-size:13px;font-weight:700;color:#374151;">Select variants</label>
          <div style="display:flex;gap:8px;">
            <button type="button" data-role="all" style="padding:8px 10px;border:1px solid #d1d5db;background:#fff;border-radius:10px;cursor:pointer;font-weight:700;">All</button>
            <button type="button" data-role="clear" style="padding:8px 10px;border:1px solid #d1d5db;background:#fff;border-radius:10px;cursor:pointer;font-weight:700;">Clear</button>
          </div>
        </div>

        <div style="display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-bottom:18px;align-content:start;">
          ${VARIANT_OPTIONS.map((item) => variantChip(item, state.variants.has(item.value))).join('')}
        </div>

        ${
          state.selectedType === 'accordion'
            ? `
              <div style="margin-bottom:18px;padding:12px;border:1px solid #e5e7eb;border-radius:14px;background:#fafafa;">
                <div style="font-size:13px;font-weight:800;color:#111827;margin-bottom:6px;">Existing accordion</div>
                <div style="font-size:13px;color:#6b7280;margin-bottom:12px;">
                  ${
                    existingAccordion
                      ? `Current accordion found. Total items: ${existingAccordionCount}. Drag handle ⋮⋮ can reorder items.`
                      : 'Place the cursor inside an existing accordion to edit it.'
                  }
                </div>

                <div style="display:flex;flex-wrap:wrap;gap:10px;">
                  <button
                    type="button"
                    data-role="add-existing"
                    ${existingAccordion ? '' : 'disabled'}
                    style="padding:10px 12px;border:1px solid #d1d5db;background:${existingAccordion ? '#fff' : '#f3f4f6'};color:${existingAccordion ? '#111827' : '#9ca3af'};border-radius:12px;cursor:${existingAccordion ? 'pointer' : 'not-allowed'};font-weight:700;"
                  >
                    Add to existing
                  </button>

                  <button
                    type="button"
                    data-role="remove-existing"
                    ${existingAccordion ? '' : 'disabled'}
                    style="padding:10px 12px;border:1px solid #d1d5db;background:${existingAccordion ? '#fff' : '#f3f4f6'};color:${existingAccordion ? '#111827' : '#9ca3af'};border-radius:12px;cursor:${existingAccordion ? 'pointer' : 'not-allowed'};font-weight:700;"
                  >
                    Remove from existing
                  </button>
                </div>
              </div>
            `
            : ''
        }

        <div style="display:flex;justify-content:flex-end;gap:10px;padding:10px 0 0;border-top:1px solid #e5e7eb;position:sticky;bottom:0;background:#fff;">
          <button
            type="button"
            data-role="insert"
            style="padding:10px 14px;border:0;background:#4f46e5;color:#fff;border-radius:12px;cursor:pointer;font-weight:800;"
          >
            Insert ${esc(selectedHeading)}
          </button>
        </div>
      `;

      const countInput = right.querySelector('[data-role="count"]');
      countInput.addEventListener('input', () => {
        state.count = clampCount(countInput.value, 3);
      });

      right.querySelector('[data-role="all"]').addEventListener('click', () => {
        state.variants = new Set(VARIANT_OPTIONS.map((item) => item.value));
        renderRight();
      });

      right.querySelector('[data-role="clear"]').addEventListener('click', () => {
        state.variants = new Set();
        renderRight();
      });

      right.querySelectorAll('[data-variant]').forEach((button) => {
        button.addEventListener('click', () => {
          const value = button.getAttribute('data-variant');
          if (state.variants.has(value)) state.variants.delete(value);
          else state.variants.add(value);
          renderRight();
        });
      });

      const addExisting = right.querySelector('[data-role="add-existing"]');
      if (addExisting) {
        addExisting.addEventListener('click', () => {
          if (addToExistingAccordion(editor, state.count)) {
            renderRight();
          }
        });
      }

      const removeExisting = right.querySelector('[data-role="remove-existing"]');
      if (removeExisting) {
        removeExisting.addEventListener('click', () => {
          if (removeFromExistingAccordion(editor, state.count)) {
            renderRight();
          }
        });
      }

      right.querySelector('[data-role="insert"]').addEventListener('click', async () => {
        const variants = [...state.variants];

        await ctx.execute({
          type: state.selectedType,
          count: state.count,
          variants: variants.length ? variants : ['primary'],
        });

        ctx.close();
      });
    };

    renderLeft();
    renderRight();

    layout.appendChild(left);
    layout.appendChild(right);
    menu.appendChild(layout);

    return true;
  },

  async run(editor, payload) {
    ensureAccordionInteractions(editor);

    const config = normalizePayload(payload, this.value || 'accordion');

    const html = renderByType(config.type, config.count, config.variants);

    editor.insertHTML(html);

    editor.surface.querySelectorAll('[data-mnb-element="accordion"]').forEach((accordion) => {
      ensureAccordionTail(accordion);
      ensureAfterBlock(editor, accordion);
    });

    editor.alert(`${titleFor(config.type)} inserted.`, 'success');
    return config.type;
  },
});