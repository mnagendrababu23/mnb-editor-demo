import { buttonTool } from '../core/toolkit.js';

const STYLE_TAG_ID = 'mnb-list-tool-styles-v3';

const PRESETS = [
  { id: 'disc', label: 'Disc', kind: 'ul', style: 'disc', group: 'bullets' },
  { id: 'circle', label: 'Circle', kind: 'ul', style: 'circle', group: 'bullets' },
  { id: 'square', label: 'Square', kind: 'ul', style: 'square', group: 'bullets' },
  { id: 'disclosure-open', label: 'Open', kind: 'ul', style: 'disclosure-open', group: 'bullets' },
  { id: 'disclosure-closed', label: 'Closed', kind: 'ul', style: 'disclosure-closed', group: 'bullets' },
  { id: 'none', label: 'None', kind: 'ul', style: 'none', group: 'bullets' },

  { id: 'decimal', label: '1. 2. 3.', kind: 'ol', style: 'decimal', group: 'numbering' },
  { id: 'lower-alpha', label: 'a. b. c.', kind: 'ol', style: 'lower-alpha', group: 'numbering' },
  { id: 'upper-alpha', label: 'A. B. C.', kind: 'ol', style: 'upper-alpha', group: 'numbering' },
  { id: 'lower-roman', label: 'i. ii. iii.', kind: 'ol', style: 'lower-roman', group: 'numbering' },
  { id: 'upper-roman', label: 'I. II. III.', kind: 'ol', style: 'upper-roman', group: 'numbering' },

  { id: 'checkmarks', label: 'Checkmarks', kind: 'ul', style: 'checkmarks', group: 'special' },
  { id: 'cross-marks', label: 'Cross marks', kind: 'ul', style: 'cross-marks', group: 'special' },
];

function installStyles(editor) {
  const doc = editor?.root?.ownerDocument || document;
  if (doc.getElementById(STYLE_TAG_ID)) return;

  const style = doc.createElement('style');
  style.id = STYLE_TAG_ID;
  style.textContent = `
    .mnb-list-popover {
      width: 332px;
      padding: 10px;
      border-radius: 16px;
      background: rgba(255, 255, 255, 0.96);
      border: 1px solid rgba(15, 23, 42, 0.08);
      box-shadow:
        0 16px 40px rgba(15, 23, 42, 0.14),
        0 2px 8px rgba(15, 23, 42, 0.08);
      backdrop-filter: blur(10px);
    }

    .mnb-list-popover-headline {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 8px;
      padding: 2px 4px 8px;
      border-bottom: 1px solid rgba(148, 163, 184, 0.18);
    }

    .mnb-list-popover-title {
      font-size: 13px;
      font-weight: 700;
      color: #0f172a;
      letter-spacing: 0.01em;
    }

    .mnb-list-popover-subtitle {
      font-size: 11px;
      color: #64748b;
    }

    .mnb-list-sections {
      display: grid;
      gap: 10px;
      margin-top: 8px;
    }

    .mnb-list-section {
      display: grid;
      gap: 8px;
    }

    .mnb-list-section-label {
      display: inline-flex;
      align-items: center;
      width: fit-content;
      padding: 3px 8px;
      border-radius: 999px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      font-size: 10px;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #64748b;
    }

    .mnb-list-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 8px;
    }

    .mnb-list-grid.special {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .mnb-list-tile {
      position: relative;
      display: grid;
      gap: 6px;
      padding: 8px;
      min-height: 86px;
      border-radius: 12px;
      background: #ffffff;
      border: 1px solid #e5e7eb;
      cursor: pointer;
      transition:
        transform .16s ease,
        box-shadow .16s ease,
        border-color .16s ease,
        background .16s ease;
    }

    .mnb-list-tile:hover {
      transform: translateY(-1px);
      border-color: #93c5fd;
      background: #fcfdff;
      box-shadow: 0 10px 20px rgba(15, 23, 42, 0.08);
    }

    .mnb-list-tile:focus-visible {
      outline: none;
      border-color: #60a5fa;
      box-shadow:
        0 0 0 3px rgba(96, 165, 250, 0.2),
        0 10px 20px rgba(15, 23, 42, 0.08);
    }

    .mnb-list-tile.is-active {
      border-color: #60a5fa;
      background: linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%);
      box-shadow:
        inset 0 0 0 1px rgba(96, 165, 250, 0.22),
        0 10px 20px rgba(15, 23, 42, 0.08);
    }

    .mnb-list-tile-check {
      position: absolute;
      top: 6px;
      right: 6px;
      width: 16px;
      height: 16px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      background: #2563eb;
      color: #fff;
      font-size: 10px;
      font-weight: 800;
      opacity: 0;
      transform: scale(.85);
      transition: opacity .16s ease, transform .16s ease;
      pointer-events: none;
    }

    .mnb-list-tile.is-active .mnb-list-tile-check {
      opacity: 1;
      transform: scale(1);
    }

    .mnb-list-preview {
      display: grid;
      gap: 5px;
      padding: 6px 6px 4px;
      border-radius: 10px;
      background: #f8fafc;
      border: 1px solid #eef2f7;
    }

    .mnb-list-preview-row {
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: center;
      gap: 7px;
      min-height: 12px;
    }

    .mnb-list-preview-marker {
      min-width: 22px;
      color: #111827;
      font-size: 13px;
      line-height: 1;
      font-weight: 700;
      white-space: nowrap;
      text-align: left;
    }

    .mnb-list-preview-line {
      height: 5px;
      border-radius: 999px;
      background: linear-gradient(90deg, #cbd5e1 0%, #e5e7eb 100%);
    }

    .mnb-list-tile-label {
      text-align: center;
      font-size: 10px;
      line-height: 1.2;
      font-weight: 700;
      color: #475569;
      letter-spacing: 0.01em;
    }

    /* toolbar button design */
    .mnb-tool[data-tool="list"] .mnb-tool-button {
      gap: 6px;
      padding-inline: 10px;
      min-width: 44px;
      transition:
        background .16s ease,
        border-color .16s ease,
        box-shadow .16s ease,
        color .16s ease;
    }

    .mnb-tool[data-tool="list"] .mnb-tool-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 18px;
      flex: 0 0 24px;
      overflow: visible;
    }

    .mnb-list-toolbar-glyph {
      position: relative;
      display: grid;
      gap: 2px;
      width: 20px;
      overflow: visible;
    }

    .mnb-list-toolbar-row {
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: center;
      gap: 3px;
      min-height: 4px;
    }

    .mnb-list-toolbar-marker {
      min-width: 6px;
      font-size: 7px;
      line-height: 1;
      font-weight: 800;
      color: currentColor;
      text-align: left;
      white-space: nowrap;
    }

    .mnb-list-toolbar-line {
      height: 2px;
      border-radius: 999px;
      background: currentColor;
      opacity: .75;
    }

    .mnb-list-toolbar-badge {
      position: absolute;
      right: 0;
      top: -2px;
      min-width: 10px;
      height: 10px;
      padding: 0 3px;
      border-radius: 999px;
      display: grid;
      place-items: center;
      background: #dbeafe;
      color: #1d4ed8;
      font-size: 6px;
      font-weight: 800;
      line-height: 1;
      border: 1px solid rgba(37, 99, 235, .16);
      box-shadow: 0 1px 2px rgba(15, 23, 42, .08);
      pointer-events: none;
    }

    .mnb-tool[data-tool="list"] .mnb-tool-button.has-menu .mnb-tool-caret {
      margin-left: 0;
      font-size: 10px;
      opacity: .72;
      transition: transform .18s ease, opacity .18s ease;
    }

    .mnb-tool[data-tool="list"] .mnb-tool-button.is-open .mnb-tool-caret {
      transform: rotate(180deg);
      opacity: 1;
    }

    .mnb-tool[data-tool="list"] .mnb-tool-button.is-active-list {
      background: linear-gradient(180deg, #f8fbff 0%, #eef6ff 100%);
      border-color: rgba(96, 165, 250, .55);
      box-shadow: inset 0 0 0 1px rgba(96, 165, 250, .15);
    }

    .mnb-checkmarks,
    .mnb-cross-marks {
      list-style: none !important;
      padding-left: 1.6em;
    }

    .mnb-checkmarks > li,
    .mnb-cross-marks > li {
      position: relative;
    }

    .mnb-checkmarks > li::before,
    .mnb-cross-marks > li::before {
      position: absolute;
      left: -1.35em;
      top: 0;
      font-weight: 700;
      line-height: inherit;
      color: currentColor;
    }

    .mnb-checkmarks > li::before {
      content: '✓';
    }

    .mnb-cross-marks > li::before {
      content: '✗';
    }
  `;

  doc.head.appendChild(style);
}

function getListButton(editor) {
  return editor?.root?.querySelector('[data-tool="list"] .mnb-tool-button') || null;
}

function getSelectedList(editor) {
  const block = editor.getSelectedBlock?.();
  return block?.closest?.('ul,ol') || block?.querySelector?.('ul,ol') || null;
}

function markerSamples(style) {
  switch (style) {
    case 'disc':
      return ['•', '•', '•'];
    case 'circle':
      return ['◦', '◦', '◦'];
    case 'square':
      return ['▪', '▪', '▪'];
    case 'disclosure-open':
      return ['▾', '▾', '▾'];
    case 'disclosure-closed':
      return ['▸', '▸', '▸'];
    case 'decimal':
      return ['1.', '2.', '3.'];
    case 'lower-alpha':
      return ['a.', 'b.', 'c.'];
    case 'upper-alpha':
      return ['A.', 'B.', 'C.'];
    case 'lower-roman':
      return ['i.', 'ii.', 'iii.'];
    case 'upper-roman':
      return ['I.', 'II.', 'III.'];
    case 'checkmarks':
      return ['✓', '✓', '✓'];
    case 'cross-marks':
      return ['✗', '✗', '✗'];
    case 'none':
      return ['', '', ''];
    default:
      return ['•', '•', '•'];
  }
}

function cleanListClasses(list) {
  list.classList.remove('mnb-checkmarks', 'mnb-cross-marks');
}

function convertListTag(list, nextTag) {
  if (!list || !nextTag) return list;
  if (list.tagName.toLowerCase() === nextTag) return list;

  const replacement = list.ownerDocument.createElement(nextTag);

  [...list.attributes].forEach((attr) => {
    replacement.setAttribute(attr.name, attr.value);
  });

  while (list.firstChild) {
    replacement.appendChild(list.firstChild);
  }

  list.replaceWith(replacement);
  return replacement;
}

function ensureList(editor, kind) {
  let list = getSelectedList(editor);

  if (!list) {
    editor.exec(kind === 'ol' ? 'insertOrderedList' : 'insertUnorderedList', null, 'list');
    return getSelectedList(editor);
  }

  return convertListTag(list, kind);
}

function getActivePreset(editor) {
  const list = getSelectedList(editor);
  if (!list) return null;

  const kind = list.tagName.toLowerCase();
  let style = (list.dataset.mnbListStyle || list.style.listStyleType || '').toLowerCase();

  if (list.classList.contains('mnb-checkmarks')) style = 'checkmarks';
  if (list.classList.contains('mnb-cross-marks')) style = 'cross-marks';

  return PRESETS.find((item) => item.kind === kind && item.style === style) || null;
}

function updateToolbarIcon(editor) {
  const button = getListButton(editor);
  if (!button) return;

  installStyles(editor);

  const icon = button.querySelector('.mnb-tool-icon');
  if (!icon) return;

  const activePreset = getActivePreset(editor);
  const markers = markerSamples(activePreset?.style || 'disc');

  let badge = '';
  if (activePreset?.kind === 'ol') badge = '1';
  else if (activePreset?.style === 'checkmarks') badge = '✓';
  else if (activePreset?.style === 'cross-marks') badge = '✗';

  icon.innerHTML = `
    <span class="mnb-list-toolbar-glyph" aria-hidden="true">
      ${markers.slice(0, 3).map((marker) => `
        <span class="mnb-list-toolbar-row">
          <span class="mnb-list-toolbar-marker">${marker || '&nbsp;'}</span>
          <span class="mnb-list-toolbar-line"></span>
        </span>
      `).join('')}
      ${badge ? `<span class="mnb-list-toolbar-badge">${badge}</span>` : ''}
    </span>
  `;

  button.classList.toggle('is-active-list', !!activePreset);
}

function applyPreset(editor, preset) {
  const list = ensureList(editor, preset.kind);

  if (!list) {
    editor.alert('Could not apply list style.', 'error');
    return;
  }

  cleanListClasses(list);

  if (preset.style === 'checkmarks') {
    list.style.listStyleType = 'none';
    list.classList.add('mnb-checkmarks');
  } else if (preset.style === 'cross-marks') {
    list.style.listStyleType = 'none';
    list.classList.add('mnb-cross-marks');
  } else {
    list.style.listStyleType = preset.style;
  }

  list.dataset.mnbListStyle = preset.style;

  editor.saveHistory('list-style');
  editor.refreshStatus?.();
  editor.captureSelection?.();
  updateToolbarIcon(editor);
  editor.alert(`${preset.label} list applied.`, 'success');
}

function buildTile(editor, preset, activePresetId) {
  const tile = document.createElement('button');
  tile.type = 'button';
  tile.className = 'mnb-list-tile';
  if (activePresetId === preset.id) tile.classList.add('is-active');

  const rows = markerSamples(preset.style)
    .map((marker) => `
      <div class="mnb-list-preview-row">
        <span class="mnb-list-preview-marker">${marker || '&nbsp;'}</span>
        <span class="mnb-list-preview-line"></span>
      </div>
    `)
    .join('');

  tile.innerHTML = `
    <span class="mnb-list-tile-check">✓</span>
    <div class="mnb-list-preview">${rows}</div>
    <div class="mnb-list-tile-label">${preset.label}</div>
  `;

  tile.addEventListener('mousedown', (event) => event.preventDefault());
  tile.addEventListener('click', () => {
    applyPreset(editor, preset);
    editor.closeToolMenu?.();
  });

  return tile;
}

function buildSection(editor, label, presets, activePresetId, extraClass = '') {
  const section = document.createElement('section');
  section.className = 'mnb-list-section';

  const heading = document.createElement('div');
  heading.className = 'mnb-list-section-label';
  heading.textContent = label;

  const grid = document.createElement('div');
  grid.className = `mnb-list-grid ${extraClass}`.trim();

  presets.forEach((preset) => {
    grid.appendChild(buildTile(editor, preset, activePresetId));
  });

  section.appendChild(heading);
  section.appendChild(grid);
  return section;
}

function openListPopover(editor) {
  const anchor = getListButton(editor);
  if (!anchor) return;

  if (editor.activePopover && editor.activePopoverAnchor === anchor) {
    editor.closeToolMenu?.();
    return;
  }

  installStyles(editor);
  editor.hideTooltipNow?.();
  editor.closeToolMenu?.();

  const activePreset = getActivePreset(editor);
  const activePresetId = activePreset?.id || '';

  const popover = document.createElement('div');
  popover.className = 'mnb-tool-popover mnb-list-popover';
  popover.dataset.area = 'top';

  popover.innerHTML = `
    <div class="mnb-list-popover-headline">
      <div>
        <div class="mnb-list-popover-title">List styles</div>
        <div class="mnb-list-popover-subtitle">Choose a visual preset</div>
      </div>
    </div>
  `;

  const sections = document.createElement('div');
  sections.className = 'mnb-list-sections';

  sections.appendChild(
    buildSection(
      editor,
      'Bullets',
      PRESETS.filter((item) => item.group === 'bullets'),
      activePresetId
    )
  );

  sections.appendChild(
    buildSection(
      editor,
      'Numbering',
      PRESETS.filter((item) => item.group === 'numbering'),
      activePresetId
    )
  );

  sections.appendChild(
    buildSection(
      editor,
      'Special',
      PRESETS.filter((item) => item.group === 'special'),
      activePresetId,
      'special'
    )
  );

  popover.appendChild(sections);

  editor.popoverHost?.appendChild(popover);
  editor.activePopover = popover;
  editor.activePopoverAnchor = anchor;
  anchor.classList.add('is-open');
  editor.positionToolMenu?.(anchor, popover, 'top');
}

function bindToolbarIconSync(editor) {
  if (editor.__mnbListIconSyncBound) return;
  editor.__mnbListIconSyncBound = true;

  const refresh = () => requestAnimationFrame(() => updateToolbarIcon(editor));

  editor.surface?.addEventListener('keyup', refresh);
  editor.surface?.addEventListener('mouseup', refresh);
  editor.surface?.addEventListener('focus', refresh);
  document.addEventListener('selectionchange', refresh);
}

export default buttonTool({
  id: 'list',
  label: 'List',
  icon: '•',
  title: 'List',
  toolbarLabel: 'List',
  onRendered(editor, element) {
    installStyles(editor);
    bindToolbarIconSync(editor);

    const button = element.querySelector('.mnb-tool-button');
    if (!button || button.dataset.mnbListReady === 'true') {
      updateToolbarIcon(editor);
      return;
    }

    button.dataset.mnbListReady = 'true';
    button.classList.add('has-menu');

    if (!button.querySelector('.mnb-tool-caret')) {
      const caret = document.createElement('span');
      caret.className = 'mnb-tool-caret';
      caret.textContent = '▾';
      button.appendChild(caret);
    }

    button.dataset.tooltipBody = 'Open list style presets.';
    updateToolbarIcon(editor);
  },
  async run(editor) {
    openListPopover(editor);
  },
});