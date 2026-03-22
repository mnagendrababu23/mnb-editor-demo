const DEFAULT_ICONS = {
  undo: '↶',
  redo: '↷',
  logs: '📝',
  block: '¶',
  size: 'A',
  family: '𝓕',
  bold: 'B',
  italic: 'I',
  underline: 'U',
  strike: 'S',
  color: '⬤',
  highlight: '🖍',
  list: '•',
  sublist: '↳',
  indentLess: '⇤',
  indentMore: '⇥',
  sort: '⇅',
  showHide: '👁',
  alignLeft: '≡',
  alignCenter: '≣',
  alignRight: '☰',
  justify: '☷',
  vertical: '↕',
  horizontal: '↔',
  lineHeight: '⇕',
  spacing: '⟷',
  spaceBefore: '⤒',
  spaceAfter: '⤓',
  table: '▦',
  grid: '#',
  hr: '—',
  find: '⌕',
  shapes: '⬠',
  signature: '✍',
  image: '🖼',
  video: '🎬',
  file: '📎',
  wordArt: '𝓦',
  date: '📅',
  embed: '⧉',
  comments: '💬',
  box: '⬚',
  wordCount: '123',
  link: '🔗',
  clear: '⌫',
  emoji: '😊',
  charmap: 'Ω',
  preview: '👁',
  code: '</>',
  fullscreen: '⛶',
  elements: '▣',
  layout: '▥',
  gallery: '🗂',
  theme: '◐',
  quote: '❝',
  shortcuts: '⌨',
  error: '⚠',
  alerts: '🔔',
  animation: '✨',
  gradient: '🌈',
  currency: '₹',
  unicode: '☯',
  sprint: '{}',
  export: '⬇',
  language: '🌐',
  print: '🖨',
};

const BLOCK_SELECTOR = 'p,h1,h2,h3,h4,h5,h6,blockquote,pre,li,td,th,div,section,article';

function uid(prefix = 'mnb') {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function downloadBlob(filename, blob) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 3000);
}

export class MNBEditor {
  constructor(target, options = {}) {
    this.target = typeof target === 'string' ? document.querySelector(target) : target;
    if (!this.target) throw new Error('Editor target not found.');

    this.options = {
      value: '',
      placeholder: 'Start typing here...',
      theme: 'light',
      debug: false,
      maxHistory: 80,
      alertPosition: 'top-right',
      ...options,
    };

    this.tools = options.tools || [];
    this.toolMap = new Map(this.tools.map((tool) => [tool.id, tool]));
    this.logs = [];
    this.history = [];
    this.future = [];
    this.currentRange = null;
    this.debugErrors = false;
    this.codeView = false;
    this.previewView = false;
    this.gridLinesVisible = true;
    this.selectionObserverAttached = false;

    this.fontFaces = new Map();
    this.externalFontLinks = new Map();
    this.fontFamilyResetValue = '__default-font__';
    this.fontFamilyUploadValue = '__upload-font__';
    this.fontUploadAccept = this.options.fontUploadAccept || '.ttf,.otf,.woff,.woff2';
    this.defaultFontFamilyValue =
      this.options.defaultFontFamily || 'Inter, "Segoe UI", Arial, sans-serif';
    this.fontFamilyOptions = [];
    this.initializeFontFamilies();

    this.render();
    this.ensureTextAnimationStyles();
    this.root.classList.add('show-grid-lines');
    this.bindCoreEvents();
    this.setHTML(this.options.value || '<p><br></p>', false);
    this.saveHistory('init');
    this.log('info', 'Editor initialized', { toolCount: this.tools.length });
    this.refreshStatus();
  }

  getDefaultFontFamilies() {
    return [
      { label: 'Default', value: this.fontFamilyResetValue, previewValue: this.defaultFontFamilyValue, system: true },
      { label: 'Inter', value: 'Inter, "Segoe UI", Arial, sans-serif' },
      { label: 'Arial', value: 'Arial, Helvetica, sans-serif' },
      { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
      { label: 'Verdana', value: 'Verdana, Geneva, sans-serif' },
      { label: 'Tahoma', value: 'Tahoma, Geneva, sans-serif' },
      { label: 'Trebuchet MS', value: '"Trebuchet MS", Helvetica, sans-serif' },
      { label: 'Segoe UI', value: '"Segoe UI", Arial, sans-serif' },
      { label: 'Georgia', value: 'Georgia, "Times New Roman", serif' },
      { label: 'Times New Roman', value: '"Times New Roman", Times, serif' },
      { label: 'Garamond', value: 'Garamond, Georgia, serif' },
      { label: 'Palatino', value: '"Palatino Linotype", "Book Antiqua", Palatino, serif' },
      { label: 'Courier New', value: '"Courier New", Courier, monospace' },
      { label: 'Lucida Console', value: '"Lucida Console", Monaco, monospace' },
      { label: 'Brush Script MT', value: '"Brush Script MT", cursive' },
      { label: 'Monospace', value: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace' },
      { label: 'Serif', value: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif' },
      { label: 'Sans Serif', value: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif' },
    ];
  }

  normalizeFontFamilyOption(option) {
    const source = typeof option === 'string' ? { label: option, value: option } : { ...(option || {}) };
    const label = String(source.label || source.name || source.family || source.value || '').trim();
    if (!label) return null;

    const value = String(source.value || source.family || label).trim();
    return {
      label,
      value,
      previewValue: String(source.previewValue || value).trim() || value,
      href: source.href || source.cssUrl || '',
      system: Boolean(source.system),
      uploaded: Boolean(source.uploaded),
    };
  }

  upsertFontFamilyOption(option, { prepend = false } = {}) {
    const normalized = this.normalizeFontFamilyOption(option);
    if (!normalized) return null;

    const index = this.fontFamilyOptions.findIndex((item) => item.label === normalized.label || item.value === normalized.value);
    if (index >= 0) {
      const merged = { ...this.fontFamilyOptions[index], ...normalized };
      this.fontFamilyOptions.splice(index, 1);
      if (prepend) {
        this.fontFamilyOptions.unshift(merged);
      } else {
        this.fontFamilyOptions.splice(index, 0, merged);
      }
      return merged;
    }

    if (prepend) {
      this.fontFamilyOptions.unshift(normalized);
    } else {
      this.fontFamilyOptions.push(normalized);
    }
    return normalized;
  }

  initializeFontFamilies() {
    this.fontFamilyOptions = [];

    this.getDefaultFontFamilies().forEach((item) => this.upsertFontFamilyOption(item));

    const extraFonts = Array.isArray(this.options.fontFamilies) ? this.options.fontFamilies : [];
    extraFonts.forEach((item) => {
      const normalized = this.normalizeFontFamilyOption(item);
      if (!normalized) return;
      if (normalized.href) {
        this.registerExternalFont(normalized.label, normalized.href, normalized.value, { silent: true });
      } else {
        this.upsertFontFamilyOption(normalized);
      }
    });

    const webFonts = Array.isArray(this.options.webFonts) ? this.options.webFonts : [];
    webFonts.forEach((item) => {
      if (!item) return;
      const font = typeof item === 'string'
        ? { label: item, href: '', value: item }
        : item;
      this.registerExternalFont(
        font.label || font.name || font.family || font.value,
        font.href || font.cssUrl || '',
        font.value || font.family || font.label || font.name,
        { silent: true },
      );
    });

    this.syncFontFamilyTool();
  }

  getFontFamilyToolOptions() {
    const options = this.fontFamilyOptions.map((item) => ({
      label: item.label,
      value: item.value,
      style: item.previewValue ? { fontFamily: item.previewValue } : undefined,
    }));

    options.push({
      label: 'Upload custom font…',
      value: this.fontFamilyUploadValue,
    });

    return options;
  }

  getFontFamilyTool() {
    return this.toolMap.get('font-family') || null;
  }

  getFontFamilyLabel(value) {
    const found = this.fontFamilyOptions.find((item) => item.value === value);
    if (found) return found.label;

    const first = String(value || '').split(',')[0].trim().replace(/^['"]|['"]$/g, '');
    return first || 'Font';
  }

  syncFontFamilyTool(nextValue = null) {
    const tool = this.getFontFamilyTool();
    if (!tool) return;

    tool.options = this.getFontFamilyToolOptions();

    if (nextValue != null && nextValue !== '') {
      tool.value = nextValue;
    } else if (!tool.value) {
      const preferred = this.fontFamilyOptions.find((item) => item.label === 'Inter') || this.fontFamilyOptions[0] || null;
      tool.value = preferred?.value;
    }

    const button = this.root?.querySelector('[data-tool="font-family"] .mnb-tool-button');
    if (button) {
      this.updateToolButtonState(tool, button);
    }
  }

  updateToolButtonState(tool, button = null) {
    const targetButton =
      button ||
      this.root?.querySelector(`[data-tool="${tool.id}"] .mnb-tool-button`);

    if (!targetButton) return;

    const valueNode = targetButton.querySelector('.mnb-tool-value');
    if (valueNode) {
      valueNode.textContent = this.getToolValueLabel(tool);
    }

    const colorIndicator = targetButton.querySelector('.mnb-tool-color-indicator');
    if (colorIndicator) {
      colorIndicator.style.background = tool.value || '#111827';
    }
  }

  ensureUniqueFontName(name = 'Custom Font') {
    const base = String(name).trim() || 'Custom Font';
    if (!this.fontFamilyOptions.some((item) => item.label === base)) return base;

    let index = 2;
    let next = `${base} ${index}`;
    while (this.fontFamilyOptions.some((item) => item.label === next)) {
      index += 1;
      next = `${base} ${index}`;
    }
    return next;
  }

  getFontFormatFromFile(file) {
    const extension = String(file?.name || '').split('.').pop().toLowerCase();
    const formats = {
      ttf: 'truetype',
      otf: 'opentype',
      woff: 'woff',
      woff2: 'woff2',
    };
    return formats[extension] || '';
  }

  getExternalFontLinksHTML() {
    return [...this.externalFontLinks.values()]
      .map((href) => `<link rel="stylesheet" href="${escapeHtml(href)}">`)
      .join('');
  }

  getFontFaceCSS() {
    return [...this.fontFaces.values()]
      .map((item) => item.css)
      .join('');
  }

  registerExternalFont(name, href, familyValue = null, { silent = false } = {}) {
    const label = this.ensureUniqueFontName(name || familyValue || 'Web Font');
    const value = String(familyValue || label).trim();

    if (href && !this.externalFontLinks.has(href)) {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      link.dataset.mnbExternalFont = label;
      document.head.appendChild(link);
      this.externalFontLinks.set(href, href);
    }

    const option = this.upsertFontFamilyOption({
      label,
      value,
      previewValue: value,
    }, { prepend: true });

    this.syncFontFamilyTool(option?.value || value);
    if (!silent) {
      this.alert(`Font "${label}" is ready.`, 'success');
    }
    return option?.value || value;
  }

  async pickAndRegisterFont() {
    const file = await this.pickFiles({ accept: this.fontUploadAccept });
    if (!file) return null;
    return this.registerFontFace('', file);
  }

  render() {
    this.target.innerHTML = '';
    this.root = document.createElement('div');
    this.root.className = `mnb-editor-shell theme-${this.options.theme}`;
    this.root.innerHTML = `
      <div class="mnb-editor-frame mnb-editor-frame-docs">
        <div class="mnb-editor-main">
          <div class="mnb-editor-topbar mnb-editor-topbar-docs">
            <div class="mnb-toolbar mnb-toolbar-top"></div>
          </div>
          <div class="mnb-editor-rulerbar">
            <div class="mnb-ruler-wrap">
              <div class="mnb-ruler-track" aria-label="Document ruler">
                <div class="mnb-ruler-fill"></div>
                <div class="mnb-ruler-ticks"></div>
                <button type="button" class="mnb-ruler-handle mnb-ruler-handle-left" aria-label="Left margin"></button>
                <button type="button" class="mnb-ruler-handle mnb-ruler-handle-right" aria-label="Right margin"></button>
              </div>
            </div>
          </div>
          <div class="mnb-editor-body">
            <div class="mnb-canvas-wrap">
              <div class="mnb-doc-page">
                <div class="mnb-surface" contenteditable="true" spellcheck="true"></div>
                <textarea class="mnb-code-surface" hidden></textarea>
                <iframe class="mnb-preview-surface" hidden title="Editor preview"></iframe>
              </div>
            </div>
          </div>
          <div class="mnb-statusbar">
            <div class="mnb-status-left">
              <span class="mnb-status-item" data-role="words">Words: 0</span>
              <span class="mnb-status-item" data-role="chars">Characters: 0</span>
              <span class="mnb-status-item" data-role="theme">Theme: ${this.options.theme}</span>
            </div>
            <div class="mnb-status-right">
              <span class="mnb-status-item" data-role="mode">Mode: Visual</span>
            </div>
          </div>
        </div>
      </div>
      <div class="mnb-tooltip-host"></div>
      <div class="mnb-popover-host"></div>
      <div class="mnb-alert-host ${this.options.alertPosition}"></div>
      <div class="mnb-modal-host" hidden></div>
    `;

    this.target.appendChild(this.root);

    this.toolbarTop = this.root.querySelector('.mnb-toolbar-top');
    this.toolbarLeft = this.root.querySelector('.mnb-toolbar-left');
    this.surface = this.root.querySelector('.mnb-surface');
    this.codeSurface = this.root.querySelector('.mnb-code-surface');
    this.previewSurface = this.root.querySelector('.mnb-preview-surface');
    this.docPage = this.root.querySelector('.mnb-doc-page');
    this.rulerTrack = this.root.querySelector('.mnb-ruler-track');
    this.rulerTicks = this.root.querySelector('.mnb-ruler-ticks');
    this.rulerLeftHandle = this.root.querySelector('.mnb-ruler-handle-left');
    this.rulerRightHandle = this.root.querySelector('.mnb-ruler-handle-right');
    this.tooltipHost = this.root.querySelector('.mnb-tooltip-host');
    this.popoverHost = this.root.querySelector('.mnb-popover-host');
    this.alertHost = this.root.querySelector('.mnb-alert-host');
    this.modalHost = this.root.querySelector('.mnb-modal-host');

    this.surface.dataset.placeholder = this.options.placeholder;

    this.rulerState = {
      pageWidth: this.options.pageWidth || 920,
      left: this.options.marginLeft || 72,
      right: this.options.marginRight || 72,
    };

    this.renderToolbar();
    this.buildRuler();
  }

  ensureTextAnimationStyles() {
    const styleId = 'mnb-text-animation-runtime-styles';
    if (document.getElementById(styleId)) return;

    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
      .mnb-surface [data-text-animation]{
        display:inline-block;
        will-change:transform,text-shadow;
      }

      .mnb-surface [data-text-animation="pulse"]{
        animation:mnb-pulse 1.4s ease-in-out infinite;
      }

      .mnb-surface [data-text-animation="float"]{
        animation:mnb-floaty 1.8s ease-in-out infinite;
      }

      .mnb-surface [data-text-animation="glow"]{
        animation:mnb-glow 1.8s ease-in-out infinite;
      }

      @keyframes mnb-pulse{
        0%,100%{transform:scale(1)}
        50%{transform:scale(1.03)}
      }

      @keyframes mnb-floaty{
        0%,100%{transform:translateY(0)}
        50%{transform:translateY(-3px)}
      }

      @keyframes mnb-glow{
        0%,100%{text-shadow:none}
        50%{text-shadow:0 0 18px rgba(79,70,229,.35)}
      }
    `;

    document.head.appendChild(style);
  }

  renderToolbar() {
    this.renderToolbarArea(this.toolbarTop, this.tools, 'top');
    if (this.toolbarLeft) {
      this.renderToolbarArea(this.toolbarLeft, this.tools, 'left');
    }
  }

  buildRuler() {
    if (!this.rulerTicks || !this.rulerTrack) return;

    this.rulerTicks.innerHTML = '';
    const divisions = 18;

    for (let index = 0; index <= divisions; index += 1) {
      const tick = document.createElement('div');
      tick.className = 'mnb-ruler-major';
      tick.style.left = `${(index / divisions) * 100}%`;

      if (index > 0 && index < divisions) {
        const label = document.createElement('span');
        label.className = 'mnb-ruler-label';
        label.textContent = String(index);
        tick.appendChild(label);
      }

      this.rulerTicks.appendChild(tick);
    }

    this.bindRulerEvents();
    this.applyRulerState();
    window.addEventListener('resize', () => this.positionRulerHandles(), { passive: true });
  }

  bindRulerEvents() {
    if (!this.rulerLeftHandle || !this.rulerRightHandle) return;

    const bindDrag = (handle, side) => {
      handle.addEventListener('mousedown', (event) => {
        event.preventDefault();
        const startX = event.clientX;
        const startValue = this.rulerState[side];

        const move = (moveEvent) => {
          const dx = moveEvent.clientX - startX;
          const pageWidth = this.rulerState.pageWidth;
          const minMargin = 24;
          const minContentWidth = 240;
          let next = side === 'left' ? startValue + dx : startValue - dx;
          const max = pageWidth - minContentWidth - (side === 'left' ? this.rulerState.right : this.rulerState.left);

          next = Math.max(minMargin, Math.min(max, next));
          this.rulerState[side] = Math.round(next);
          this.applyRulerState();
        };

        const up = () => {
          document.removeEventListener('mousemove', move);
          document.removeEventListener('mouseup', up);
        };

        document.addEventListener('mousemove', move);
        document.addEventListener('mouseup', up);
      });
    };

    bindDrag(this.rulerLeftHandle, 'left');
    bindDrag(this.rulerRightHandle, 'right');
  }

  applyRulerState() {
    if (!this.root) return;
    this.root.style.setProperty('--mnb-page-width', `${this.rulerState.pageWidth}px`);
    this.root.style.setProperty('--mnb-doc-margin-left', `${this.rulerState.left}px`);
    this.root.style.setProperty('--mnb-doc-margin-right', `${this.rulerState.right}px`);
    this.positionRulerHandles();
  }

  positionRulerHandles() {
    if (!this.rulerTrack || !this.rulerLeftHandle || !this.rulerRightHandle) return;

    const width = this.rulerTrack.clientWidth || this.rulerState.pageWidth;
    const leftX = Math.max(0, Math.min(width, this.rulerState.left));
    const rightX = Math.max(0, Math.min(width, width - this.rulerState.right));

    this.rulerLeftHandle.style.left = `${leftX}px`;
    this.rulerRightHandle.style.left = `${rightX}px`;
  }

  getToolValueLabel(tool) {
    const options =
      Array.isArray(tool.options) ? tool.options :
        Array.isArray(tool.items) ? tool.items :
          Array.isArray(tool.choices) ? tool.choices :
            [];

    const value = tool.value;

    const found = options.find((option) => {
      const item = typeof option === 'string' ? { label: option, value: option } : option;
      return item.value === value;
    });

    if (found) return typeof found === 'string' ? found : found.label;
    if (typeof value === 'string' && value.trim()) return value;
    if (tool.toolbarLabel) return tool.toolbarLabel;
    return tool.label || tool.title || tool.id;
  }

  renderToolbarArea(container, tools, area = 'top') {
    if (!container) return;
    container.innerHTML = '';

    const filteredTools = tools.filter((tool) => {
      return (tool.area || 'top') === area;
    });

    const groups = new Map();

    filteredTools.forEach((tool) => {
      const groupKey = tool.group || 'general';
      if (!groups.has(groupKey)) {
        groups.set(groupKey, {
          key: groupKey,
          label: tool.groupLabel || groupKey,
          tools: [],
        });
      }
      groups.get(groupKey).tools.push(tool);
    });

    groups.forEach((group) => {
      const section = document.createElement('section');
      section.className = `mnb-toolbar-group mnb-toolbar-group-${area}`;
      section.dataset.group = group.key;
      section.setAttribute('aria-label', group.label);
      section.title = group.label;

      group.tools.forEach((tool) => {
        const element = this.buildToolElement(tool);
        section.appendChild(element);
        if (typeof tool.onRendered === 'function') {
          tool.onRendered(this, element);
        }
      });

      container.appendChild(section);
    });
  }

  buildToolElement(tool) {
    const wrap = document.createElement('div');
    wrap.className = `mnb-tool mnb-tool-${tool.kind || tool.type || 'button'}`;
    wrap.dataset.tool = tool.id;

    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'mnb-tool-button';

    const docsSelectIds = ['block-styles', 'font-sizes', 'font-family'];
    const isDocsSelect =
      tool.toolbarVariant === 'docs-select' ||
      docsSelectIds.includes(tool.id);

    const isColorPicker = tool.toolbarVariant === 'color-picker';
    const hasCustomMenu = typeof tool.renderMenu === 'function';

    const isSelect =
      hasCustomMenu ||
      isDocsSelect ||
      isColorPicker ||
      tool.kind === 'select' ||
      tool.type === 'select' ||
      Array.isArray(tool.options) ||
      Array.isArray(tool.items) ||
      Array.isArray(tool.choices);

    const isIconOnlyMenu = Boolean(tool.iconOnlyMenu);
    const showDocsSelect = isDocsSelect && !isIconOnlyMenu && !isColorPicker;
    const showSelectValue = isSelect && !isIconOnlyMenu && !isDocsSelect && !isColorPicker;

    if (isSelect) {
      button.classList.add('mnb-tool-button-select', 'has-menu');

      if (showDocsSelect) {
        button.classList.add('mnb-tool-button-doc-select');
      } else {
        button.classList.add('mnb-tool-button-icon');
      }
    } else {
      button.classList.add('mnb-tool-button-icon');
    }

    const tooltip = this.getToolTooltipContent(tool);
    button.setAttribute('aria-label', tooltip.title);
    button.dataset.tooltipTitle = tooltip.title;
    button.dataset.tooltipBody = tooltip.body;
    if (tooltip.shortcut) button.dataset.tooltipShortcut = tooltip.shortcut;

    if (isColorPicker) {
      button.style.display = 'inline-flex';
      button.style.alignItems = 'center';
      button.style.gap = '6px';
      button.style.padding = '6px 8px';

      const letterWrap = document.createElement('span');
      letterWrap.style.display = 'inline-flex';
      letterWrap.style.flexDirection = 'column';
      letterWrap.style.alignItems = 'center';
      letterWrap.style.justifyContent = 'center';
      letterWrap.style.lineHeight = '1';

      const icon = document.createElement('span');
      icon.className = 'mnb-tool-icon';
      icon.textContent = tool.icon || 'A';
      icon.style.fontWeight = '700';
      icon.style.fontSize = '16px';

      const indicator = document.createElement('span');
      indicator.className = 'mnb-tool-color-indicator';
      indicator.style.display = 'block';
      indicator.style.width = '14px';
      indicator.style.height = '3px';
      indicator.style.marginTop = '2px';
      indicator.style.borderRadius = '999px';
      indicator.style.background = tool.value || '#111827';

      const caret = document.createElement('span');
      caret.className = 'mnb-tool-caret';
      caret.textContent = '▾';

      letterWrap.appendChild(icon);
      letterWrap.appendChild(indicator);
      button.appendChild(letterWrap);
      button.appendChild(caret);
    } else if (showDocsSelect) {
      const value = document.createElement('span');
      value.className = 'mnb-tool-value';
      value.textContent = this.getToolValueLabel(tool);

      const caret = document.createElement('span');
      caret.className = 'mnb-tool-caret';
      caret.textContent = '▾';

      button.appendChild(value);
      button.appendChild(caret);
    } else {
      const icon = document.createElement('span');
      icon.className = 'mnb-tool-icon';
      icon.textContent = tool.icon || DEFAULT_ICONS[tool.iconKey] || '•';
      button.appendChild(icon);

      if (showSelectValue) {
        const value = document.createElement('span');
        value.className = 'mnb-tool-value';
        value.textContent = this.getToolValueLabel(tool);
        button.appendChild(value);

        const caret = document.createElement('span');
        caret.className = 'mnb-tool-caret';
        caret.textContent = '▾';
        button.appendChild(caret);
      }
    }

    button.addEventListener('mousedown', (event) => event.preventDefault());
    button.addEventListener('mouseenter', () => this.showTooltip(button));
    button.addEventListener('mouseleave', () => this.hideTooltipSoon());
    button.addEventListener('focus', () => this.showTooltip(button));
    button.addEventListener('blur', () => this.hideTooltipSoon());

    if (isSelect) {
      button.addEventListener('click', () => this.toggleToolMenu(button, tool));
    } else {
      button.addEventListener('click', async () => {
        this.hideTooltipNow();
        this.closeToolMenu();
        try {
          await this.executeTool(tool.id);
        } catch (error) {
          this.handleError(error, tool.id);
        }
      });
    }

    wrap.appendChild(button);
    return wrap;
  }

  getToolTooltipContent(tool) {
    const title = tool.title || tool.label || tool.toolbarLabel || tool.id;

    const shortcuts = {
      undo: 'Ctrl+Z / ⌘Z',
      redo: 'Ctrl+Y / ⌘⇧Z',
      bold: 'Ctrl+B / ⌘B',
      italic: 'Ctrl+I / ⌘I',
      underline: 'Ctrl+U / ⌘U',
      'find-replace': 'Ctrl+F / ⌘F',
      print: 'Ctrl+P / ⌘P',
    };

    const explicit = tool.usage || tool.helpText || tool.description;

    const isSelectLike =
      typeof tool.renderMenu === 'function' ||
      tool.kind === 'select' ||
      tool.type === 'select' ||
      Array.isArray(tool.options) ||
      Array.isArray(tool.items) ||
      Array.isArray(tool.choices) ||
      ['block-styles', 'font-sizes', 'font-family'].includes(tool.id) ||
      tool.toolbarVariant === 'color-picker';

    const defaults = {
      undo: 'Revert the last editing change.',
      redo: 'Apply the last reverted change again.',
      logs: 'Open the editor activity log and debug details.',
      preview: 'Preview the current output without editing the content.',
      'view-code': 'Switch between visual editing and raw HTML code.',
      'full-screen': 'Expand the editor to a larger working area.',
      export: 'Download the content in a supported output format.',
      print: 'Open the browser print dialog for the current document.',
      'keyboard-shortcuts': 'View common shortcuts for Windows and Mac.',
      table: 'Insert a table or manage rows, columns, merge and borders.',
      image: 'Insert an image from a URL or uploaded source.',
      video: 'Insert a video embed or media block.',
      embed: 'Insert embedded content such as iframe blocks.',
      link: 'Add or edit a hyperlink on the selected text.',
      comments: 'Attach a visible comment marker to the current block.',
      'show-alerts': 'Choose where editor alerts appear on the screen.',
      'error-messages': 'Enable or disable detailed console error logging.',
      theme: 'Switch the editor between light and dark themes.',
      languages: 'Choose the editing language or locale setting.',
    };

    const generic = isSelectLike
      ? `Open choices for ${title.toLowerCase()} and apply one option.`
      : `Apply ${title.toLowerCase()} to the current selection or editor state.`;

    return {
      title,
      body: explicit || defaults[tool.id] || generic,
      shortcut: tool.shortcut || shortcuts[tool.id] || '',
    };
  }

  showTooltip(anchor) {
    clearTimeout(this.tooltipShowTimer);
    clearTimeout(this.tooltipHideTimer);
    if (!this.tooltipHost) return;

    const title = anchor.dataset.tooltipTitle || '';
    const body = anchor.dataset.tooltipBody || '';
    const shortcut = anchor.dataset.tooltipShortcut || '';
    if (!title && !body) return;

    this.tooltipShowTimer = setTimeout(() => {
      if (!this.tooltipHost) return;

      this.tooltipHost.innerHTML = '';
      const tip = document.createElement('div');
      tip.className = 'mnb-floating-tooltip';
      if (shortcut) tip.classList.add('has-shortcut');
      tip.innerHTML = `
        <div class="mnb-floating-tooltip-title">${escapeHtml(title)}</div>
        ${body ? `<div class="mnb-floating-tooltip-body">${escapeHtml(body)}</div>` : ''}
        ${shortcut ? `<div class="mnb-floating-tooltip-shortcut">${escapeHtml(shortcut)}</div>` : ''}
      `;

      this.tooltipHost.appendChild(tip);
      this.activeTooltip = tip;
      this.activeTooltipAnchor = anchor;
      this.positionTooltip(anchor, tip);
    }, 120);
  }

  positionTooltip(anchor, tip) {
    const rect = anchor.getBoundingClientRect();
    const hostRect = this.tooltipHost?.getBoundingClientRect() || {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };

    tip.style.left = '0px';
    tip.style.top = '0px';

    requestAnimationFrame(() => {
      const width = tip.offsetWidth;
      const height = tip.offsetHeight;

      let left = (rect.left - hostRect.left) + (rect.width / 2) - (width / 2);
      let top = (rect.bottom - hostRect.top) + 12;

      if (top + height > hostRect.height - 12) {
        top = (rect.top - hostRect.top) - height - 12;
      }

      left = Math.min(Math.max(12, left), hostRect.width - width - 12);
      top = Math.min(Math.max(12, top), hostRect.height - height - 12);

      tip.style.left = `${left}px`;
      tip.style.top = `${top}px`;
    });
  }

  hideTooltipSoon() {
    clearTimeout(this.tooltipShowTimer);
    clearTimeout(this.tooltipHideTimer);
    this.tooltipHideTimer = setTimeout(() => this.hideTooltipNow(), 180);
  }

  hideTooltipNow() {
    clearTimeout(this.tooltipShowTimer);
    clearTimeout(this.tooltipHideTimer);
    if (this.tooltipHost) this.tooltipHost.innerHTML = '';
    this.activeTooltip = null;
    this.activeTooltipAnchor = null;
  }

  toggleToolMenu(anchor, tool) {
    if (this.activePopoverAnchor === anchor) {
      this.closeToolMenu();
      return;
    }

    this.hideTooltipNow();
    this.closeToolMenu();

    const menu = document.createElement('div');
    menu.className = 'mnb-tool-popover';
    menu.dataset.area = tool.area || 'top';

    const columns = Math.max(1, Number(tool.menuColumns) || 1);
    const iconOnlyMenu = Boolean(tool.iconOnlyMenu);
    const iconGridMenu = iconOnlyMenu && columns > 1;

    menu.dataset.columns = String(columns);
    if (iconGridMenu) {
      menu.dataset.iconOnlyMenu = 'true';
    }

    const header = document.createElement('div');
    header.className = 'mnb-tool-popover-head';
    header.textContent = tool.title || tool.label || tool.toolbarLabel || tool.id;

    const list = document.createElement('div');
    list.className = 'mnb-tool-popover-list';

    if (columns > 1) {
      list.style.display = 'grid';
      list.style.gridTemplateColumns = `repeat(${columns}, minmax(0, 1fr))`;
      list.style.gap = '8px';
      list.style.alignItems = 'stretch';
    }

    const mountMenu = () => {
      if (!menu.isConnected) {
        this.popoverHost.appendChild(menu);
      }

      this.activePopover = menu;
      this.activePopoverAnchor = anchor;
      anchor.classList.add('is-open');
      this.positionToolMenu(anchor, menu, tool.area || 'top');
    };

    const syncToolValue = (nextValue, fallbackValue = '') => {
      const resolved =
        nextValue == null || nextValue === ''
          ? fallbackValue
          : nextValue;

      const displayValue =
        resolved && typeof resolved === 'object' && resolved.type
          ? resolved.type
          : resolved;

      if (displayValue != null && displayValue !== '') {
        tool.value = displayValue;
      }

      this.updateToolButtonState(tool, anchor);
      return tool.value;
    };

    const applyValue = async (runValue, displayValue = runValue) => {
      const nextValue = await this.executeTool(tool.id, runValue);
      return syncToolValue(nextValue, displayValue);
    };

    const execute = async (runValue) => {
      const nextValue = await this.executeTool(tool.id, runValue);
      return syncToolValue(nextValue, runValue);
    };

    if (typeof tool.renderMenu === 'function') {
      menu.classList.add('mnb-tool-popover-custom');

      try {
        const handled = tool.renderMenu(this, {
          tool,
          menu,
          header,
          list,
          anchor,
          columns,
          iconOnlyMenu,
          iconGridMenu,
          applyValue,
          execute,
          setValue: (value) => syncToolValue(value, value),
          close: () => this.closeToolMenu(),
        });

        if (handled !== false) {
          mountMenu();
          return;
        }
      } catch (error) {
        this.handleError(error, tool.id);
        this.closeToolMenu();
        return;
      }
    }

    menu.appendChild(header);
    menu.appendChild(list);

    const menuOptions =
      Array.isArray(tool.options) ? tool.options :
        Array.isArray(tool.items) ? tool.items :
          Array.isArray(tool.choices) ? tool.choices :
            [];

    menuOptions.forEach((option) => {
      const item = typeof option === 'string' ? { label: option, value: option } : option;

      const opt = document.createElement('button');
      opt.type = 'button';
      opt.className = 'mnb-tool-popover-option';
      opt.textContent = item.label ?? item.value ?? '';

      if (iconGridMenu) {
        opt.title = item.label ?? item.value ?? '';
        opt.setAttribute('aria-label', item.label ?? item.value ?? '');
        opt.style.display = 'inline-flex';
        opt.style.alignItems = 'center';
        opt.style.justifyContent = 'center';
        opt.style.width = '44px';
        opt.style.minWidth = '44px';
        opt.style.height = '44px';
        opt.style.minHeight = '44px';
        opt.style.padding = '0';
        opt.style.textAlign = 'center';
        opt.style.lineHeight = '1';
      } else {
        opt.style.width = '100%';
        opt.style.minWidth = 'unset';
        opt.style.height = 'auto';
        opt.style.minHeight = '38px';
        opt.style.padding = '10px 12px';
        opt.style.textAlign = 'left';
      }

      if (item.style && typeof item.style === 'object') {
        Object.assign(opt.style, item.style);
      }

      if (tool.value === item.value) {
        opt.classList.add('is-active');
      }

      opt.addEventListener('click', async () => {
        try {
          await applyValue(item.value, item.value);
        } catch (error) {
          this.handleError(error, tool.id);
        } finally {
          this.closeToolMenu();
        }
      });

      list.appendChild(opt);
    });

    mountMenu();
  }

  positionToolMenu(anchor, menu, area = 'top') {
    const rect = anchor.getBoundingClientRect();
    const hostRect = this.popoverHost?.getBoundingClientRect() || {
      left: 0,
      top: 0,
      width: window.innerWidth,
      height: window.innerHeight,
    };

    menu.style.left = '0px';
    menu.style.top = '0px';

    requestAnimationFrame(() => {
      const popRect = menu.getBoundingClientRect();

      let left = rect.left - hostRect.left;
      let top = rect.bottom - hostRect.top + 10;

      const maxLeft = hostRect.width - popRect.width - 12;
      const maxTop = hostRect.height - popRect.height - 12;

      if (left > maxLeft) left = maxLeft;
      if (top > maxTop) top = rect.top - hostRect.top - popRect.height - 10;

      menu.style.left = `${Math.max(12, left)}px`;
      menu.style.top = `${Math.max(12, top)}px`;
    });
  }

  closeToolMenu() {
    if (this.activePopoverAnchor) {
      this.activePopoverAnchor.classList.remove('is-open');
    }
    if (this.popoverHost) {
      this.popoverHost.innerHTML = '';
    }
    this.activePopover = null;
    this.activePopoverAnchor = null;
  }

  bindCoreEvents() {
    this.surface.addEventListener('input', () => {
      this.debouncedSnapshot('typing');
      this.refreshStatus();
    });

    this.surface.addEventListener('keyup', () => this.refreshStatus());
    this.surface.addEventListener('mouseup', () => this.captureSelection());
    this.surface.addEventListener('focus', () => this.captureSelection());

    if (!this.selectionObserverAttached) {
      document.addEventListener('selectionchange', () => {
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        if (this.isRangeInsideSurface(range)) {
          this.currentRange = range.cloneRange();
        }
      });
      this.selectionObserverAttached = true;
    }

    this.codeSurface.addEventListener('input', () => {
      if (this.codeView) {
        this.surface.innerHTML = this.codeSurface.value;
        this.updatePreview();
        this.refreshStatus();
      }
    });

    document.addEventListener('mousedown', (event) => {
      if (this.activePopover) {
        const clickedPopover = this.activePopover.contains(event.target);
        const clickedAnchor = this.activePopoverAnchor?.contains(event.target);
        if (!clickedPopover && !clickedAnchor) {
          this.closeToolMenu();
        }
      }
      if (this.activeTooltipAnchor && !this.activeTooltipAnchor.contains(event.target)) {
        this.hideTooltipNow();
      }
    });

    window.addEventListener('resize', () => {
      this.closeToolMenu();
      this.hideTooltipNow();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        this.closeToolMenu();
        this.hideTooltipNow();
      }
    });
  }

  isNodeInsideSurface(node) {
    if (!node || !this.surface) return false;
    return node === this.surface || this.surface.contains(node);
  }

  isRangeInsideSurface(range) {
    if (!range) return false;
    try {
      return this.isNodeInsideSurface(range.commonAncestorContainer);
    } catch {
      return false;
    }
  }

  createFallbackRange() {
    const range = document.createRange();
    range.selectNodeContents(this.surface);
    range.collapse(false);
    return range;
  }

  getSafeRange(preferredRange = null) {
    if (this.isRangeInsideSurface(preferredRange)) {
      try {
        return preferredRange.cloneRange();
      } catch {
        // ignore
      }
    }

    if (this.isRangeInsideSurface(this.currentRange)) {
      try {
        return this.currentRange.cloneRange();
      } catch {
        // ignore
      }
    }

    const selection = window.getSelection();
    if (selection && selection.rangeCount) {
      const liveRange = selection.getRangeAt(0);
      if (this.isRangeInsideSurface(liveRange)) {
        try {
          return liveRange.cloneRange();
        } catch {
          // ignore
        }
      }
    }

    return this.createFallbackRange();
  }

  captureSelection(preferredRange = null) {
    const range = this.getSafeRange(preferredRange);
    if (!range) return null;
    this.currentRange = range.cloneRange();
    return this.currentRange;
  }

  restoreSelection(preferredRange = null) {
    if (!this.surface || this.codeView || this.previewView) return null;

    const selection = window.getSelection();
    if (!selection) return null;

    const safeRange = this.getSafeRange(preferredRange);
    if (!safeRange) return null;

    selection.removeAllRanges();
    selection.addRange(safeRange);
    this.currentRange = safeRange.cloneRange();
    return safeRange;
  }

  focus(preferredRange = null) {
    if (this.codeView) {
      this.codeSurface.focus();
      return;
    }
    if (this.previewView) return;

    this.surface.focus();
    this.restoreSelection(preferredRange);
  }

  executeTool(id, value = undefined) {
    const tool = this.toolMap.get(id);
    if (!tool) throw new Error(`Unknown tool: ${id}`);
    this.captureSelection();
    return tool.run(this, value);
  }

  exec(command, value = null, reason = command) {
    this.focus();
    document.execCommand(command, false, value);
    this.captureSelection();
    this.saveHistory(reason);
    this.refreshStatus();
  }

  setHTML(html, record = true) {
    this.surface.innerHTML = html;
    this.codeSurface.value = html;
    this.updatePreview();
    this.refreshStatus();
    this.captureSelection();
    if (record) this.saveHistory('set-html');
  }

  getHTML() {
    return this.codeView ? this.codeSurface.value : this.surface.innerHTML;
  }

  getText() {
    return this.surface.textContent || '';
  }

  refreshStatus() {
    const text = this.getText().replace(/\s+/g, ' ').trim();
    const words = text ? text.split(' ').length : 0;
    const chars = text.length;

    this.root.querySelector('[data-role="words"]').textContent = `Words: ${words}`;
    this.root.querySelector('[data-role="chars"]').textContent = `Characters: ${chars}`;
    this.root.querySelector('[data-role="mode"]').textContent = `Mode: ${this.codeView ? 'Code' : this.previewView ? 'Preview' : 'Visual'}`;
    this.root.querySelector('[data-role="theme"]').textContent = `Theme: ${this.options.theme}`;
  }

  debouncedSnapshot(reason) {
    clearTimeout(this.snapshotTimer);
    this.snapshotTimer = setTimeout(() => this.saveHistory(reason), 250);
  }

  saveHistory(reason = 'change') {
    const html = this.getHTML();
    const last = this.history[this.history.length - 1];
    if (last && last.html === html) return;

    this.history.push({ html, reason, at: new Date().toISOString() });
    if (this.history.length > this.options.maxHistory) {
      this.history.shift();
    }

    this.future = [];
    this.codeSurface.value = html;
    this.log('history', `Snapshot saved: ${reason}`);
    this.updatePreview();
  }

  undo() {
    if (this.history.length <= 1) {
      this.alert('Nothing to undo.', 'info');
      return;
    }

    const current = this.history.pop();
    this.future.push(current);
    const previous = this.history[this.history.length - 1];

    this.surface.innerHTML = previous.html;
    this.codeSurface.value = previous.html;
    this.updatePreview();
    this.refreshStatus();
    this.captureSelection(this.createFallbackRange());
    this.log('history', 'Undo applied');
  }

  redo() {
    if (!this.future.length) {
      this.alert('Nothing to redo.', 'info');
      return;
    }

    const next = this.future.pop();
    this.history.push(next);
    this.surface.innerHTML = next.html;
    this.codeSurface.value = next.html;
    this.updatePreview();
    this.refreshStatus();
    this.captureSelection(this.createFallbackRange());
    this.log('history', 'Redo applied');
  }

  log(type, message, data = null) {
    this.logs.push({
      id: uid('log'),
      type,
      message,
      data,
      at: new Date().toLocaleString(),
    });

    if (this.debugErrors) {
      console[type === 'error' ? 'error' : 'log'](`[MNB ${type}] ${message}`, data || '');
    }
  }

  handleError(error, toolId = 'unknown') {
    this.log('error', `Tool "${toolId}" failed`, { message: error?.message || String(error) });
    this.alert(error?.message || `Tool "${toolId}" failed.`, 'error');
    if (this.debugErrors) console.error(error);
  }

  alert(message, type = 'info', timeout = 2200) {
    const item = document.createElement('div');
    item.className = `mnb-alert ${type}`;
    item.textContent = message;
    this.alertHost.appendChild(item);

    requestAnimationFrame(() => item.classList.add('visible'));

    setTimeout(() => {
      item.classList.remove('visible');
      setTimeout(() => item.remove(), 220);
    }, timeout);
  }

  setAlertPosition(position) {
    this.alertHost.className = `mnb-alert-host ${position}`;
    this.options.alertPosition = position;
    this.alert(`Alert position changed to ${position}.`, 'success');
  }

  async form(title, fields = [], options = {}) {
    return new Promise((resolve) => {
      this.captureSelection();

      this.modalHost.hidden = false;
      this.modalHost.innerHTML = '';

      const overlay = document.createElement('div');
      overlay.className = 'mnb-modal-overlay';

      const modal = document.createElement('div');
      modal.className = 'mnb-modal';

      const form = document.createElement('form');
      form.className = 'mnb-form';
      form.innerHTML = `
        <div class="mnb-modal-head">
          <div class="mnb-modal-head-copy">
            <h3>${title}</h3>
            ${options.description ? `<p>${options.description}</p>` : ''}
          </div>
          <button type="button" class="mnb-modal-close" aria-label="Close">×</button>
        </div>
        <div class="mnb-modal-body"></div>
        <div class="mnb-modal-foot">
          <button type="button" class="mnb-btn secondary" data-cancel>Cancel</button>
          <button type="submit" class="mnb-btn primary">${options.submitText || 'Apply'}</button>
        </div>
      `;

      const body = form.querySelector('.mnb-modal-body');
      const rows = [];
      const inlineGroups = new Map();

      const getInputValue = (field, input) => {
        if (field.type === 'checkbox') return input.checked;
        if (field.type === 'file') return field.multiple ? [...input.files] : input.files[0] || null;
        return input.value;
      };

      const shouldShowField = (field, values) => {
        if (!field.showWhen) return true;

        if (typeof field.showWhen === 'function') {
          return !!field.showWhen(values);
        }

        if (typeof field.showWhen === 'object') {
          const current = values[field.showWhen.field];

          if ('equals' in field.showWhen) return current === field.showWhen.equals;
          if ('notEquals' in field.showWhen) return current !== field.showWhen.notEquals;
          if (Array.isArray(field.showWhen.in)) return field.showWhen.in.includes(current);
        }

        return true;
      };

      const createInput = (field) => {
        let input;

        if (field.type === 'select') {
          input = document.createElement('select');
          (field.options || []).forEach((opt) => {
            const item = typeof opt === 'string' ? { label: opt, value: opt } : opt;
            const option = document.createElement('option');
            option.value = item.value;
            option.textContent = item.label;
            if (field.value === item.value) option.selected = true;
            input.appendChild(option);
          });
        } else if (field.type === 'textarea') {
          input = document.createElement('textarea');
          input.rows = field.rows || 4;
          input.value = field.value || '';
        } else if (field.type === 'checkbox') {
          input = document.createElement('input');
          input.type = 'checkbox';
          input.checked = Boolean(field.value);
          input.classList.add('mnb-input-checkbox');
        } else if (field.type === 'file') {
          input = document.createElement('input');
          input.type = 'file';
          if (field.accept) input.accept = field.accept;
          if (field.multiple) input.multiple = true;
          input.classList.add('mnb-input', 'mnb-input-file');
        } else {
          input = document.createElement('input');
          input.type = field.type || 'text';
          input.value = field.value ?? '';
          if (field.min != null) input.min = field.min;
          if (field.max != null) input.max = field.max;
          if (field.step != null) input.step = field.step;
          if (field.placeholder) input.placeholder = field.placeholder;
          input.classList.add('mnb-input');
        }

        if (field.type === 'select' || field.type === 'textarea') {
          input.classList.add('mnb-input');
        }

        input.name = field.name;
        return input;
      };

      const refresh = () => {
        const values = {};
        rows.forEach(({ field, input }) => {
          values[field.name] = getInputValue(field, input);
        });

        rows.forEach(({ field, row, note, input, fileName }) => {
          const visible = shouldShowField(field, values);
          row.hidden = !visible;
          row.classList.toggle('is-hidden', !visible);

          if (field.type === 'file' && fileName) {
            const file = field.multiple ? [...(input.files || [])] : input.files?.[0] || null;
            fileName.textContent = file
              ? (Array.isArray(file) ? file.map((item) => item.name).join(', ') : file.name)
              : (field.filePlaceholder || 'No file selected');
          }

          if (note) {
            let text = '';
            if (typeof field.note === 'function') {
              text = field.note(values, input) || '';
            } else if (field.note) {
              text = String(field.note);
            }
            note.textContent = text;
            note.hidden = !text;
          }
        });
      };

      fields.forEach((field) => {
        const row = document.createElement('div');
        row.className = `mnb-field mnb-field-${field.type || 'text'}`;

        let input;
        let note = null;
        let fileName = null;

        if (field.type === 'checkbox') {
          row.classList.add('mnb-field-check');

          const inline = document.createElement('label');
          inline.className = 'mnb-check-row';

          input = createInput(field);

          const textWrap = document.createElement('div');
          textWrap.className = 'mnb-check-copy';

          const label = document.createElement('span');
          label.className = 'mnb-field-label';
          label.textContent = field.label;
          textWrap.appendChild(label);

          if (field.note) {
            note = document.createElement('small');
            note.className = 'mnb-field-note';
            textWrap.appendChild(note);
          }

          inline.appendChild(input);
          inline.appendChild(textWrap);
          row.appendChild(inline);
        } else {
          const main = document.createElement('div');
          main.className = 'mnb-field-main';

          const label = document.createElement('label');
          label.className = 'mnb-field-label';
          label.setAttribute('for', `mnb-field-${field.name}`);
          label.textContent = field.label;

          input = createInput(field);
          input.id = `mnb-field-${field.name}`;

          const control = document.createElement('div');
          control.className = 'mnb-field-control';

          if (field.type === 'file') {
            const fileWrap = document.createElement('div');
            fileWrap.className = 'mnb-file-wrap';

            fileName = document.createElement('div');
            fileName.className = 'mnb-file-name';
            fileName.textContent = field.filePlaceholder || 'No file selected';

            fileWrap.appendChild(input);
            fileWrap.appendChild(fileName);
            control.appendChild(fileWrap);
          } else {
            control.appendChild(input);
          }

          if (field.note) {
            note = document.createElement('small');
            note.className = 'mnb-field-note';
            control.appendChild(note);
          }

          main.appendChild(label);
          main.appendChild(control);
          row.appendChild(main);
        }

        input.addEventListener('input', refresh);
        input.addEventListener('change', refresh);

        let host = body;
        if (field.inlineGroup) {
          if (!inlineGroups.has(field.inlineGroup)) {
            const group = document.createElement('div');
            group.className = 'mnb-inline-fields';
            group.style.setProperty('--mnb-inline-columns', String(field.inlineColumns || 2));
            inlineGroups.set(field.inlineGroup, group);
            body.appendChild(group);
          }
          host = inlineGroups.get(field.inlineGroup);
        }

        host.appendChild(row);
        rows.push({ field, row, input, note, fileName });
      });

      refresh();

      const close = () => {
        this.modalHost.hidden = true;
        this.modalHost.innerHTML = '';
        this.focus();
      };

      form.querySelector('.mnb-modal-close').addEventListener('click', () => {
        close();
        resolve(null);
      });

      form.querySelector('[data-cancel]').addEventListener('click', () => {
        close();
        resolve(null);
      });

      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) {
          close();
          resolve(null);
        }
      });

      form.addEventListener('submit', (event) => {
        event.preventDefault();

        const values = {};
        rows.forEach(({ field, row, input }) => {
          if (row.hidden) {
            values[field.name] =
              field.type === 'checkbox' ? false :
                field.type === 'file' ? (field.multiple ? [] : null) :
                  '';
            return;
          }
          values[field.name] = getInputValue(field, input);
        });

        close();
        resolve(values);
      });

      modal.appendChild(form);
      overlay.appendChild(modal);
      this.modalHost.appendChild(overlay);

      const firstInput = form.querySelector('input,select,textarea');
      if (firstInput) setTimeout(() => firstInput.focus(), 10);
    });
  }

  async pickFiles({ accept = '*/*', multiple = false } = {}) {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = accept;
      input.multiple = multiple;
      input.addEventListener('change', () => {
        resolve(multiple ? [...input.files] : input.files[0] || null);
      });
      input.click();
    });
  }

  selectedRange(preferredRange = null) {
    return this.getSafeRange(preferredRange);
  }

  getSelectedText() {
    const range = this.selectedRange();
    return range ? range.toString() : '';
  }

  surroundSelection(tagName = 'span', options = {}, preferredRange = null) {
    this.focus(preferredRange);

    const range = this.getSafeRange(preferredRange);
    if (!range) return null;

    const wrapper = document.createElement(tagName);
    if (options.className) wrapper.className = options.className;

    Object.entries(options.attrs || {}).forEach(([key, value]) => wrapper.setAttribute(key, value));
    Object.entries(options.styles || {}).forEach(([key, value]) => {
      wrapper.style[key] = value;
    });

    if (range.collapsed) {
      wrapper.innerHTML = options.placeholder || '&#8203;';
      range.insertNode(wrapper);

      const nextRange = document.createRange();
      nextRange.selectNodeContents(wrapper);
      nextRange.collapse(false);

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(nextRange);
      this.currentRange = nextRange.cloneRange();
    } else {
      const fragment = range.extractContents();
      wrapper.appendChild(fragment);
      range.insertNode(wrapper);

      const nextRange = document.createRange();
      nextRange.selectNodeContents(wrapper);

      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(nextRange);
      this.currentRange = nextRange.cloneRange();
    }

    this.saveHistory(`surround-${tagName}`);
    this.refreshStatus();
    return wrapper;
  }

  insertHTML(html, preferredRange = null) {
    this.surface.hidden = false;
    this.codeSurface.hidden = true;
    this.previewSurface.hidden = true;
    this.codeView = false;
    this.previewView = false;

    this.surface.focus();

    const selection = window.getSelection();
    const range = this.restoreSelection(preferredRange) || this.getSafeRange(preferredRange);

    if (!selection || !range) {
      this.surface.insertAdjacentHTML('beforeend', html);
      this.captureSelection(this.createFallbackRange());
      this.saveHistory('insert-html');
      this.refreshStatus();
      return;
    }

    const fragment = range.createContextualFragment(html);
    const lastNode = fragment.lastChild;

    range.deleteContents();
    range.insertNode(fragment);

    const afterRange = document.createRange();
    if (lastNode && lastNode.parentNode) {
      afterRange.setStartAfter(lastNode);
      afterRange.collapse(true);
    } else {
      afterRange.selectNodeContents(this.surface);
      afterRange.collapse(false);
    }

    selection.removeAllRanges();
    selection.addRange(afterRange);
    this.currentRange = afterRange.cloneRange();

    this.saveHistory('insert-html');
    this.refreshStatus();
  }

  insertText(text, preferredRange = null) {
    this.surface.hidden = false;
    this.codeSurface.hidden = true;
    this.previewSurface.hidden = true;
    this.codeView = false;
    this.previewView = false;

    this.surface.focus();

    const selection = window.getSelection();
    const range = this.restoreSelection(preferredRange) || this.getSafeRange(preferredRange);

    if (!selection || !range) {
      this.surface.append(document.createTextNode(text));
      this.captureSelection(this.createFallbackRange());
      this.saveHistory('insert-text');
      this.refreshStatus();
      return;
    }

    range.deleteContents();

    const textNode = document.createTextNode(text);
    range.insertNode(textNode);

    const afterRange = document.createRange();
    afterRange.setStartAfter(textNode);
    afterRange.collapse(true);

    selection.removeAllRanges();
    selection.addRange(afterRange);
    this.currentRange = afterRange.cloneRange();

    this.saveHistory('insert-text');
    this.refreshStatus();
  }

  getSelectedBlock() {
    const range = this.selectedRange();
    if (!range) return this.surface;
    let node = range.commonAncestorContainer;
    if (node.nodeType === Node.TEXT_NODE) node = node.parentNode;
    return node.closest?.(BLOCK_SELECTOR) || this.surface;
  }

  getSelectedCell() {
    const block = this.getSelectedBlock();
    return block.closest?.('td,th') || null;
  }

  applyBlockStyle(styles = {}, attrs = {}) {
    const block = this.getSelectedBlock();
    Object.entries(styles).forEach(([key, value]) => {
      block.style[key] = value;
    });
    Object.entries(attrs).forEach(([key, value]) => {
      block.setAttribute(key, value);
    });
    this.saveHistory('block-style');
    return block;
  }

  toggleBlockClass(className) {
    const block = this.getSelectedBlock();
    block.classList.toggle(className);
    this.saveHistory(`toggle-${className}`);
    return block;
  }

  toggleCodeView() {
    this.codeView = !this.codeView;

    if (this.codeView) {
      this.codeSurface.hidden = false;
      this.codeSurface.value = this.surface.innerHTML;
      this.surface.hidden = true;
      this.previewSurface.hidden = true;
      this.previewView = false;
      this.codeSurface.focus();
    } else {
      this.surface.hidden = false;
      this.surface.innerHTML = this.codeSurface.value;
      this.codeSurface.hidden = true;
      this.updatePreview();
      this.focus();
      this.saveHistory('toggle-code');
    }

    this.refreshStatus();
  }

  togglePreview() {
    this.previewView = !this.previewView;

    if (this.previewView) {
      this.updatePreview();
      this.previewSurface.hidden = false;
      this.surface.hidden = true;
      this.codeSurface.hidden = true;
      this.codeView = false;
    } else {
      this.previewSurface.hidden = true;
      this.surface.hidden = false;
      this.focus();
    }

    this.refreshStatus();
  }

  updatePreview() {
    const html = this.codeView ? this.codeSurface.value : this.surface.innerHTML;
    const doc = this.previewSurface.contentDocument;
    if (!doc) return;

    doc.open();
    const externalFontLinks = this.getExternalFontLinksHTML();
    const fontFaceCSS = this.getFontFaceCSS();

    doc.write(`
      <html>
        <head>
          ${externalFontLinks}
          <style>
            ${fontFaceCSS}
            body{font-family:Inter,Arial,sans-serif;padding:24px;line-height:1.6;color:#111827;}
            img,video,iframe,svg,table{max-width:100%;}
            table{border-collapse:collapse;width:100%;}
            td,th{border:1px solid #d1d5db;padding:8px;}
            .mnb-hidden-block{display:none;}
            .mnb-columns{display:grid;gap:16px;}
            .mnb-columns.two{grid-template-columns:repeat(2,1fr);}
            .mnb-columns.three{grid-template-columns:repeat(3,1fr);}
            .mnb-card{border:1px solid #dbe3f0;border-radius:16px;padding:16px;background:#fff;}
            .mnb-callout{border-left:4px solid #4f46e5;background:#eef2ff;padding:16px;border-radius:12px;}
            .mnb-badge{display:inline-block;padding:6px 10px;border-radius:999px;background:#eff6ff;border:1px solid #bfdbfe;}
            [data-text-animation]{
              display:inline-block;
              will-change:transform,text-shadow;
            }
            [data-text-animation="pulse"]{animation:pulse 1.4s ease-in-out infinite;}
            [data-text-animation="float"]{animation:floaty 1.8s ease-in-out infinite;}
            [data-text-animation="glow"]{animation:glow 1.8s ease-in-out infinite;}
            @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.03)}}
            @keyframes floaty{0%,100%{transform:translateY(0)}50%{transform:translateY(-3px)}}
            @keyframes glow{0%,100%{text-shadow:none}50%{text-shadow:0 0 18px rgba(79,70,229,.35)}}
          </style>
        </head>
        <body>${html}</body>
      </html>
    `);
    doc.close();
  }

  toggleFullscreen() {
    const root = this.root;
    if (!root) return;

    const frame =
      root.querySelector('.mnb-editor-frame') ||
      root.querySelector('.mnb-editor-frame-docs');

    const main =
      root.querySelector('.mnb-editor-main') ||
      frame;

    const topbar =
      root.querySelector('.mnb-editor-topbar') ||
      root.querySelector('.mnb-editor-topbar-docs');

    const rulerBar = root.querySelector('.mnb-editor-rulerbar');
    const body = root.querySelector('.mnb-editor-body');
    const statusbar = root.querySelector('.mnb-statusbar');

    const readInlineStyle = (node) => {
      if (!node) return null;
      return node.getAttribute('style') || '';
    };

    const restoreInlineStyle = (node, styleText) => {
      if (!node) return;
      if (styleText) node.setAttribute('style', styleText);
      else node.removeAttribute('style');
    };

    const entering = !root.classList.contains('is-fullscreen');

    if (entering) {
      this.__mnbFullscreenState = {
        bodyOverflow: document.body.style.overflow || '',
        root: readInlineStyle(root),
        frame: readInlineStyle(frame),
        main: readInlineStyle(main),
        topbar: readInlineStyle(topbar),
        rulerBar: readInlineStyle(rulerBar),
        body: readInlineStyle(body),
        statusbar: readInlineStyle(statusbar),
      };

      root.classList.add('is-fullscreen');
      document.body.style.overflow = 'hidden';

      Object.assign(root.style, {
        position: 'fixed',
        inset: '0',
        zIndex: '9999',
        width: '100vw',
        maxWidth: '100vw',
        height: '100vh',
        maxHeight: '100vh',
        margin: '0',
        borderRadius: '0',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      });

      if (frame) {
        Object.assign(frame.style, {
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          minHeight: '0',
          height: '100%',
          overflow: 'hidden',
        });
      }

      if (main) {
        Object.assign(main.style, {
          display: 'flex',
          flexDirection: 'column',
          flex: '1 1 auto',
          minHeight: '0',
          height: '100%',
          overflow: 'hidden',
        });
      }

      if (topbar) {
        topbar.style.flex = '0 0 auto';
      }

      if (rulerBar) {
        rulerBar.style.flex = '0 0 auto';
      }

      if (body) {
        Object.assign(body.style, {
          flex: '1 1 auto',
          minHeight: '0',
          height: 'auto',
          overflow: 'auto',
        });
      }

      if (statusbar) {
        Object.assign(statusbar.style, {
          flex: '0 0 auto',
          marginTop: 'auto',
        });
      }

      this.closeToolMenu?.();
      this.hideTooltipNow?.();
      window.dispatchEvent(new Event('resize'));
      this.alert('Fullscreen enabled.', 'success');
      return;
    }

    root.classList.remove('is-fullscreen');

    const state = this.__mnbFullscreenState || {};
    document.body.style.overflow = state.bodyOverflow || '';

    restoreInlineStyle(root, state.root);
    restoreInlineStyle(frame, state.frame);
    restoreInlineStyle(main, state.main);
    restoreInlineStyle(topbar, state.topbar);
    restoreInlineStyle(rulerBar, state.rulerBar);
    restoreInlineStyle(body, state.body);
    restoreInlineStyle(statusbar, state.statusbar);

    delete this.__mnbFullscreenState;

    window.dispatchEvent(new Event('resize'));
    this.alert('Fullscreen disabled.', 'success');
  }

  setTheme(theme) {
    this.root.classList.remove('theme-light', 'theme-dark');
    this.root.classList.add(`theme-${theme}`);
    this.options.theme = theme;
    this.refreshStatus();
    this.saveHistory('theme-change');
  }

  async setFontFamily(family) {
    let nextFamily = family;

    if (!nextFamily || nextFamily === this.fontFamilyResetValue) {
      nextFamily = this.defaultFontFamilyValue;
    }

    if (nextFamily === this.fontFamilyUploadValue) {
      nextFamily = await this.pickAndRegisterFont();
      if (!nextFamily) return null;
    }

    const label = this.getFontFamilyLabel(nextFamily);
    this.upsertFontFamilyOption({
      label,
      value: nextFamily,
      previewValue: nextFamily,
    }, { prepend: true });

    this.surroundSelection('span', {
      styles: { fontFamily: nextFamily },
      reason: `font-family-${label.toLowerCase().replace(/\s+/g, '-')}`,
    });

    this.syncFontFamilyTool(nextFamily);
    this.updatePreview();
    this.alert(`Font changed to ${label}.`, 'success');
    return nextFamily;
  }

  registerFontFace(name, file) {
    if (!file) return null;

    const extension = String(file.name || '').split('.').pop().toLowerCase();
    if (!['ttf', 'otf', 'woff', 'woff2'].includes(extension)) {
      throw new Error('Only TTF, OTF, WOFF and WOFF2 fonts are supported.');
    }

    const rawName = String(name || file.name.replace(/\.[^.]+$/, '')).trim() || 'Custom Font';
    const familyName = this.ensureUniqueFontName(rawName);
    const familyValue = `"${familyName}", sans-serif`;
    const fontUrl = URL.createObjectURL(file);
    const format = this.getFontFormatFromFile(file);
    const src = format
      ? `url(${JSON.stringify(fontUrl)}) format(${JSON.stringify(format)})`
      : `url(${JSON.stringify(fontUrl)})`;
    const css = `@font-face{font-family:${JSON.stringify(familyName)};src:${src};font-display:swap;}`;

    let style = this.fontFaces.get(familyName)?.node || null;
    if (!style) {
      style = document.createElement('style');
      style.dataset.mnbFontFace = familyName;
      document.head.appendChild(style);
    }
    style.textContent = css;

    this.fontFaces.set(familyName, {
      familyName,
      value: familyValue,
      url: fontUrl,
      css,
      node: style,
    });

    this.upsertFontFamilyOption({
      label: familyName,
      value: familyValue,
      previewValue: familyValue,
      uploaded: true,
    }, { prepend: true });

    this.syncFontFamilyTool(familyValue);
    this.updatePreview();
    return familyValue;
  }

  ensureSelectionText(fallbackText = 'Text') {
    const selected = this.getSelectedText();
    if (selected) return selected;
    this.insertText(fallbackText);
    return fallbackText;
  }

  findReplace(findText, replaceText, { caseSensitive = false, replaceAll = true } = {}) {
    const source = this.surface.innerHTML;
    const escaped = findText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const flags = caseSensitive ? 'g' : 'gi';
    const regex = new RegExp(escaped, replaceAll ? flags : flags.replace('g', ''));
    this.surface.innerHTML = source.replace(regex, replaceText);
    this.codeSurface.value = this.surface.innerHTML;
    this.saveHistory('find-replace');
    this.refreshStatus();
    this.captureSelection(this.createFallbackRange());
  }

  insertTable(rows = 2, cols = 2) {
    const safeRows = Math.max(1, Number(rows));
    const safeCols = Math.max(1, Number(cols));
    const body = Array.from({ length: safeRows })
      .map(() => `<tr>${Array.from({ length: safeCols }).map(() => '<td>Cell</td>').join('')}</tr>`)
      .join('');
    this.insertHTML(`<table class="mnb-table"><tbody>${body}</tbody></table><p><br></p>`);
  }

  addTableRow() {
    const cell = this.getSelectedCell();
    const row = cell?.closest('tr');
    if (!row) return this.alert('Place the caret inside a table row.', 'error');

    const clone = row.cloneNode(true);
    clone.querySelectorAll('td,th').forEach((item) => {
      item.innerHTML = 'Cell';
    });
    row.after(clone);
    this.saveHistory('table-add-row');
  }

  addTableColumn() {
    const cell = this.getSelectedCell();
    const table = cell?.closest('table');
    if (!table) return this.alert('Place the caret inside a table.', 'error');

    table.querySelectorAll('tr').forEach((row) => {
      const tag = row.children[0]?.tagName?.toLowerCase() === 'th' ? 'th' : 'td';
      const node = document.createElement(tag);
      node.textContent = 'Cell';
      row.appendChild(node);
    });

    this.saveHistory('table-add-col');
  }

  deleteTableRow() {
    const cell = this.getSelectedCell();
    const row = cell?.closest('tr');
    if (!row) return this.alert('Place the caret inside a table row.', 'error');
    row.remove();
    this.saveHistory('table-delete-row');
  }

  deleteTableColumn() {
    const cell = this.getSelectedCell();
    const table = cell?.closest('table');
    if (!table) return this.alert('Place the caret inside a table.', 'error');

    const index = [...cell.parentNode.children].indexOf(cell);
    table.querySelectorAll('tr').forEach((row) => row.children[index]?.remove());
    this.saveHistory('table-delete-col');
  }

  mergeCellRight() {
    const cell = this.getSelectedCell();
    if (!cell || !cell.nextElementSibling) {
      this.alert('Select a cell with a right sibling to merge.', 'error');
      return;
    }

    const span = Number(cell.getAttribute('colspan') || 1) + Number(cell.nextElementSibling.getAttribute('colspan') || 1);
    cell.setAttribute('colspan', span);
    cell.innerHTML = `${cell.innerHTML} ${cell.nextElementSibling.innerHTML}`;
    cell.nextElementSibling.remove();
    this.saveHistory('table-merge-right');
  }

  removeTable() {
    const cell = this.getSelectedCell();
    const table = cell?.closest('table');
    if (!table) return this.alert('Place the caret inside a table.', 'error');
    table.remove();
    this.saveHistory('table-remove');
  }

  setTableBorderMode(mode = 'all') {
    const cell = this.getSelectedCell();
    const table = cell?.closest('table');
    if (!table) return this.alert('Place the caret inside a table.', 'error');
    table.dataset.borderMode = mode;
    this.saveHistory(`table-border-${mode}`);
  }

  download(filename, content, mime = 'text/plain;charset=utf-8') {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
    downloadBlob(filename, blob);
    this.alert(`${filename} downloaded.`, 'success');
  }

  print() {
    const printWindow = window.open('', '_blank', 'width=900,height=700');
    if (!printWindow) {
      this.alert('Pop-up blocked. Allow pop-ups to print.', 'error');
      return;
    }

    printWindow.document.write(`
      <html>
        <head>
          <title>Print</title>
          ${this.getExternalFontLinksHTML()}
          <style>${this.getFontFaceCSS()} body{font-family:Inter,Arial,sans-serif;padding:24px}img,table,video,iframe{max-width:100%}</style>
        </head>
        <body>${this.getHTML()}</body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => printWindow.print(), 300);
  }
}

export function createEditor(target, options = {}) {
  return new MNBEditor(target, options);
}

export { escapeHtml, uid };