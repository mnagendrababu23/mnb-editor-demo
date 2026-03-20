import { buttonTool } from '../core/toolkit.js';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, Number(n) || 0));
}

function cloneEditorRange(editor) {
  const selection = window.getSelection();

  if (selection && selection.rangeCount) {
    const liveRange = selection.getRangeAt(0);
    const node = liveRange.commonAncestorContainer;
    if (node && editor.surface && (node === editor.surface || editor.surface.contains(node))) {
      return liveRange.cloneRange();
    }
  }

  if (editor.currentRange) {
    return editor.currentRange.cloneRange();
  }

  return null;
}

const WORD_ART_PRESETS = [
  {
    value: 'aurora-pop',
    label: 'Aurora Pop',
    note: 'Bold and colorful',
    family: `Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif`,
    weight: 900,
    spacing: 1.2,
    angle: 90,
    colors: ['#4f46e5', '#7c3aed', '#ec4899', '#f59e0b'],
    stroke: '#1f2937',
    strokeWidth: 1.2,
    shadow: 'extrude',
  },
  {
    value: 'sunset-stage',
    label: 'Sunset Stage',
    note: 'Warm poster vibe',
    family: `"Trebuchet MS", Arial, sans-serif`,
    weight: 900,
    spacing: 1,
    angle: 90,
    colors: ['#fb7185', '#f97316', '#facc15'],
    stroke: '#7c2d12',
    strokeWidth: 1,
    shadow: 'stack',
  },
  {
    value: 'ocean-glow',
    label: 'Ocean Glow',
    note: 'Clean neon feel',
    family: `"Arial Black", Arial, sans-serif`,
    weight: 900,
    spacing: 1,
    angle: 90,
    colors: ['#06b6d4', '#0ea5e9', '#2563eb', '#4f46e5'],
    stroke: '#082f49',
    strokeWidth: 1,
    shadow: 'glow',
  },
  {
    value: 'gold-luxe',
    label: 'Gold Luxe',
    note: 'Premium metallic',
    family: `Georgia, "Times New Roman", serif`,
    weight: 800,
    spacing: 1,
    angle: 180,
    colors: ['#fff7cc', '#fde68a', '#f59e0b', '#b45309', '#fff1a6'],
    stroke: '#78350f',
    strokeWidth: 0.9,
    shadow: 'soft',
  },
  {
    value: 'berry-neon',
    label: 'Berry Neon',
    note: 'Bright social banner',
    family: `"Arial Black", Arial, sans-serif`,
    weight: 900,
    spacing: 1.4,
    angle: 90,
    colors: ['#8b5cf6', '#d946ef', '#ec4899', '#fb7185'],
    stroke: '#3b0764',
    strokeWidth: 1,
    shadow: 'glow',
  },
  {
    value: 'mint-fresh',
    label: 'Mint Fresh',
    note: 'Modern clean headline',
    family: `"Poppins", Arial, sans-serif`,
    weight: 800,
    spacing: 0.8,
    angle: 90,
    colors: ['#22c55e', '#14b8a6', '#06b6d4'],
    stroke: '#064e3b',
    strokeWidth: 0.8,
    shadow: 'soft',
  },
  {
    value: 'chrome-flash',
    label: 'Chrome Flash',
    note: 'Shiny retro chrome',
    family: `"Arial Black", Arial, sans-serif`,
    weight: 900,
    spacing: 1,
    angle: 180,
    colors: ['#0f172a', '#94a3b8', '#ffffff', '#cbd5e1', '#111827'],
    stroke: '#0f172a',
    strokeWidth: 0.8,
    shadow: 'soft',
  },
  {
    value: 'candy-burst',
    label: 'Candy Burst',
    note: 'Playful promo style',
    family: `"Comic Sans MS", "Trebuchet MS", cursive`,
    weight: 900,
    spacing: 1,
    angle: 90,
    colors: ['#f43f5e', '#fb7185', '#f472b6', '#c084fc'],
    stroke: '#831843',
    strokeWidth: 1,
    shadow: 'soft',
  },
  {
    value: 'forest-depth',
    label: 'Forest Depth',
    note: 'Dark layered green',
    family: `"Oswald", Arial, sans-serif`,
    weight: 800,
    spacing: 1.6,
    angle: 90,
    colors: ['#14532d', '#16a34a', '#84cc16', '#d9f99d'],
    stroke: '#052e16',
    strokeWidth: 1,
    shadow: 'extrude',
  },
  {
    value: 'ruby-flame',
    label: 'Ruby Flame',
    note: 'Hot red headline',
    family: `"Arial Black", Arial, sans-serif`,
    weight: 900,
    spacing: 1,
    angle: 90,
    colors: ['#7f1d1d', '#dc2626', '#f87171', '#fecaca'],
    stroke: '#450a0a',
    strokeWidth: 1.1,
    shadow: 'extrude',
  },
  {
    value: 'ice-crystal',
    label: 'Ice Crystal',
    note: 'Frozen glass vibe',
    family: `"Segoe UI", Arial, sans-serif`,
    weight: 900,
    spacing: 1.1,
    angle: 180,
    colors: ['#f0f9ff', '#bae6fd', '#7dd3fc', '#38bdf8', '#e0f2fe'],
    stroke: '#0c4a6e',
    strokeWidth: 0.9,
    shadow: 'glow',
  },
  {
    value: 'midnight-club',
    label: 'Midnight Club',
    note: 'Dark luxury neon',
    family: `"Arial Black", Arial, sans-serif`,
    weight: 900,
    spacing: 1.5,
    angle: 120,
    colors: ['#020617', '#312e81', '#7c3aed', '#22d3ee'],
    stroke: '#020617',
    strokeWidth: 1.1,
    shadow: 'glow',
  },
  {
    value: 'peach-fizz',
    label: 'Peach Fizz',
    note: 'Soft summer promo',
    family: `"Trebuchet MS", Arial, sans-serif`,
    weight: 800,
    spacing: 0.9,
    angle: 90,
    colors: ['#fff7ed', '#fdba74', '#fb7185', '#f9a8d4'],
    stroke: '#9a3412',
    strokeWidth: 0.8,
    shadow: 'soft',
  },
  {
    value: 'lava-burst',
    label: 'Lava Burst',
    note: 'Molten orange power',
    family: `Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif`,
    weight: 900,
    spacing: 1.3,
    angle: 90,
    colors: ['#431407', '#ea580c', '#f97316', '#facc15'],
    stroke: '#1c1917',
    strokeWidth: 1.2,
    shadow: 'stack',
  },
  {
    value: 'royal-velvet',
    label: 'Royal Velvet',
    note: 'Elegant purple gold',
    family: `Georgia, "Times New Roman", serif`,
    weight: 800,
    spacing: 1,
    angle: 135,
    colors: ['#2e1065', '#6d28d9', '#a78bfa', '#fde68a'],
    stroke: '#3b0764',
    strokeWidth: 0.9,
    shadow: 'soft',
  },
  {
    value: 'lemon-zest',
    label: 'Lemon Zest',
    note: 'Fresh bright signage',
    family: `"Poppins", Arial, sans-serif`,
    weight: 900,
    spacing: 1,
    angle: 90,
    colors: ['#fef9c3', '#fde047', '#facc15', '#84cc16'],
    stroke: '#713f12',
    strokeWidth: 0.9,
    shadow: 'soft',
  },
  {
    value: 'cyber-pulse',
    label: 'Cyber Pulse',
    note: 'Electric future glow',
    family: `"Arial Black", Arial, sans-serif`,
    weight: 900,
    spacing: 1.7,
    angle: 90,
    colors: ['#06b6d4', '#22d3ee', '#a855f7', '#ec4899'],
    stroke: '#083344',
    strokeWidth: 1,
    shadow: 'glow',
  },
  {
    value: 'rose-gold',
    label: 'Rose Gold',
    note: 'Soft luxury metallic',
    family: `Georgia, "Times New Roman", serif`,
    weight: 800,
    spacing: 0.9,
    angle: 180,
    colors: ['#fff1f2', '#fbcfe8', '#fda4af', '#fb7185', '#ffe4e6'],
    stroke: '#881337',
    strokeWidth: 0.8,
    shadow: 'soft',
  },
  {
    value: 'sky-pop',
    label: 'Sky Pop',
    note: 'Cheerful blue banner',
    family: `"Trebuchet MS", Arial, sans-serif`,
    weight: 900,
    spacing: 1.2,
    angle: 90,
    colors: ['#dbeafe', '#60a5fa', '#3b82f6', '#1d4ed8'],
    stroke: '#1e3a8a',
    strokeWidth: 1,
    shadow: 'stack',
  },
  {
    value: 'grape-splash',
    label: 'Grape Splash',
    note: 'Juicy purple mix',
    family: `"Arial Black", Arial, sans-serif`,
    weight: 900,
    spacing: 1.1,
    angle: 90,
    colors: ['#4c1d95', '#7c3aed', '#a855f7', '#e879f9'],
    stroke: '#2e1065',
    strokeWidth: 1,
    shadow: 'glow',
  },
  {
    value: 'emerald-shine',
    label: 'Emerald Shine',
    note: 'Rich polished green',
    family: `"Poppins", Arial, sans-serif`,
    weight: 800,
    spacing: 1,
    angle: 180,
    colors: ['#022c22', '#065f46', '#10b981', '#6ee7b7', '#d1fae5'],
    stroke: '#052e16',
    strokeWidth: 0.9,
    shadow: 'soft',
  },
  {
    value: 'retro-wave',
    label: 'Retro Wave',
    note: '80s synth sunset',
    family: `"Arial Black", Arial, sans-serif`,
    weight: 900,
    spacing: 1.8,
    angle: 90,
    colors: ['#f472b6', '#ec4899', '#8b5cf6', '#38bdf8'],
    stroke: '#581c87',
    strokeWidth: 1,
    shadow: 'glow',
  },
  {
    value: 'frost-bite',
    label: 'Frost Bite',
    note: 'Cold sharp cyan',
    family: `"Oswald", Arial, sans-serif`,
    weight: 800,
    spacing: 1.4,
    angle: 180,
    colors: ['#ecfeff', '#a5f3fc', '#22d3ee', '#0891b2', '#164e63'],
    stroke: '#083344',
    strokeWidth: 1,
    shadow: 'extrude',
  },
  {
    value: 'cocoa-glow',
    label: 'Cocoa Glow',
    note: 'Warm brown cream',
    family: `Georgia, "Times New Roman", serif`,
    weight: 800,
    spacing: 1,
    angle: 135,
    colors: ['#422006', '#92400e', '#d97706', '#fcd34d', '#fef3c7'],
    stroke: '#451a03',
    strokeWidth: 0.9,
    shadow: 'soft',
  },
];

function getPresetByValue(value) {
  return WORD_ART_PRESETS.find((item) => item.value === value) || WORD_ART_PRESETS[0];
}

function buildGradient(preset) {
  return `linear-gradient(${preset.angle}deg, ${preset.colors.join(', ')})`;
}

function ensurePickerStyles() {
  if (document.getElementById('mnb-word-art-picker-styles')) return;

  const style = document.createElement('style');
  style.id = 'mnb-word-art-picker-styles';
  style.textContent = `
    .mnb-wa-picker{width:min(1080px,calc(100vw - 32px));max-height:min(88vh,900px);overflow:hidden;border-radius:28px;background:var(--mnb-panel, #fff);color:var(--mnb-text, #0f172a);border:1px solid var(--mnb-border, #dbe3f0);box-shadow:0 40px 100px rgba(15,23,42,.28);display:grid;grid-template-rows:auto auto auto 1fr auto}
    .mnb-wa-head{display:flex;align-items:flex-start;justify-content:space-between;gap:16px;padding:22px 24px 16px;border-bottom:1px solid var(--mnb-border, #dbe3f0);background:linear-gradient(180deg,rgba(99,102,241,.07),transparent)}
    .mnb-wa-head h3{margin:0;font-size:22px;line-height:1.1}
    .mnb-wa-head p{margin:6px 0 0;color:var(--mnb-muted, #64748b);font-size:13px}
    .mnb-wa-close{border:1px solid var(--mnb-border, #dbe3f0);background:var(--mnb-panel-2, #f8fafc);color:var(--mnb-text, #0f172a);width:42px;height:42px;border-radius:14px;font-size:24px;line-height:1;cursor:pointer}
    .mnb-wa-controls{padding:16px 24px;border-bottom:1px solid var(--mnb-border, #dbe3f0);display:grid;grid-template-columns:minmax(0,1.7fr) repeat(3,minmax(120px,.6fr));gap:12px;background:var(--mnb-panel-2, #f8fafc)}
    .mnb-wa-field{display:grid;gap:6px}
    .mnb-wa-field span{font-size:12px;font-weight:700;color:var(--mnb-muted, #64748b);text-transform:uppercase;letter-spacing:.04em}
    .mnb-wa-field input,.mnb-wa-field select{width:100%;padding:12px 14px;border-radius:14px;border:1px solid var(--mnb-border, #dbe3f0);background:var(--mnb-panel, #fff);color:var(--mnb-text, #0f172a);outline:none}
    .mnb-wa-stage{padding:20px 24px 8px;background:linear-gradient(180deg,rgba(15,23,42,.02),transparent)}
    .mnb-wa-preview{min-height:148px;border-radius:24px;border:1px solid var(--mnb-border, #dbe3f0);background:radial-gradient(circle at top,#ffffff,#f8fafc 55%,#eef2ff 100%);display:grid;place-items:center;padding:24px;overflow:hidden;position:relative}
    .theme-dark .mnb-wa-preview,.mnb-editor-shell.theme-dark .mnb-wa-preview{background:radial-gradient(circle at top,#1e293b,#0f172a 60%,#020617 100%)}
    .mnb-wa-preview::after{content:'';position:absolute;inset:auto -20% -35% -20%;height:120px;background:radial-gradient(circle,rgba(99,102,241,.16),transparent 68%);pointer-events:none}
    .mnb-wa-preview .mnb-word-art{transform:translateY(-2px)}
    .mnb-wa-grid-wrap{padding:16px 24px 24px;overflow:auto}
    .mnb-wa-grid-title{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:0 0 12px}
    .mnb-wa-grid-title strong{font-size:14px}
    .mnb-wa-grid-title span{font-size:12px;color:var(--mnb-muted, #64748b)}
    .mnb-wa-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px}
    .mnb-wa-card{position:relative;text-align:left;border:1px solid var(--mnb-border, #dbe3f0);background:var(--mnb-panel, #fff);border-radius:22px;padding:14px;display:grid;gap:10px;cursor:pointer;transition:.18s ease;box-shadow:0 10px 24px rgba(15,23,42,.05)}
    .mnb-wa-card:hover{transform:translateY(-2px);box-shadow:0 16px 32px rgba(15,23,42,.1);border-color:rgba(99,102,241,.3)}
    .mnb-wa-card.is-active{border-color:#6366f1;box-shadow:0 0 0 3px rgba(99,102,241,.15),0 16px 32px rgba(15,23,42,.12)}
    .mnb-wa-card-head{display:flex;align-items:center;justify-content:space-between;gap:8px}
    .mnb-wa-card-head strong{font-size:13px;line-height:1.2}
    .mnb-wa-card-head span{font-size:11px;color:var(--mnb-muted, #64748b)}
    .mnb-wa-swatches{display:flex;gap:6px;flex-wrap:wrap}
    .mnb-wa-swatches i{width:14px;height:14px;border-radius:999px;border:1px solid rgba(255,255,255,.65);box-shadow:0 0 0 1px rgba(15,23,42,.06)}
    .mnb-wa-sample{min-height:84px;border-radius:18px;padding:14px;display:grid;place-items:center;background:linear-gradient(180deg,rgba(15,23,42,.03),rgba(15,23,42,.01));overflow:hidden}
    .theme-dark .mnb-wa-sample,.mnb-editor-shell.theme-dark .mnb-wa-sample{background:linear-gradient(180deg,rgba(255,255,255,.03),rgba(255,255,255,.01))}
    .mnb-wa-foot{padding:16px 24px;border-top:1px solid var(--mnb-border, #dbe3f0);display:flex;align-items:center;justify-content:space-between;gap:14px;background:var(--mnb-panel, #fff)}
    .mnb-wa-tip{font-size:12px;color:var(--mnb-muted, #64748b)}
    .mnb-wa-actions{display:flex;gap:10px;flex-wrap:wrap}

    .mnb-wa-picker,
    .mnb-wa-stage,
    .mnb-wa-preview,
    .mnb-wa-grid,
    .mnb-wa-card,
    .mnb-wa-sample {
      -webkit-user-modify: read-only;
    }

    .mnb-wa-preview,
    .mnb-wa-card,
    .mnb-wa-sample,
    .mnb-word-art[data-mnb-wa-preview="true"] {
      user-select: none;
      -webkit-user-select: none;
      caret-color: transparent;
    }

    .mnb-word-art[data-mnb-wa-preview="true"],
    .mnb-word-art[data-mnb-wa-preview="true"] * {
      user-select: none;
      -webkit-user-select: none;
      caret-color: transparent;
      pointer-events: none;
    }

    .mnb-wa-field input,
    .mnb-wa-field select {
      user-select: auto;
      -webkit-user-select: auto;
      caret-color: auto;
      pointer-events: auto;
    }

    @media (max-width:900px){.mnb-wa-controls{grid-template-columns:1fr 1fr}.mnb-wa-picker{width:min(100vw - 20px,1080px)}}
    @media (max-width:640px){.mnb-wa-controls{grid-template-columns:1fr}.mnb-wa-foot{flex-direction:column;align-items:stretch}.mnb-wa-actions{justify-content:stretch}.mnb-wa-actions .mnb-btn{width:100%}}
  `;
  document.head.appendChild(style);
}

function renderWordArtMarkup({
  tag,
  text,
  preset,
  fontSize,
  uppercase,
  previewMode = false,
}) {
  const chosenTag = previewMode
    ? 'div'
    : ['div', 'h1', 'h2', 'p', 'span'].includes(tag)
      ? tag
      : 'div';

  const safeText = escapeHtml(text || 'Word Art');
  const finalText = uppercase ? safeText.toUpperCase() : safeText;
  const gradient = buildGradient(preset);

  return `
    <${chosenTag}
      class="mnb-word-art mnb-word-art-shadow-${escapeHtml(preset.shadow)}"
      data-preset="${escapeHtml(preset.value)}"
      data-word-art-preset="${escapeHtml(preset.value)}"
      data-word-art-shadow="${escapeHtml(preset.shadow)}"
      data-mnb-wa-preview="${previewMode ? 'true' : 'false'}"
      contenteditable="false"
      spellcheck="false"
      draggable="false"
      tabindex="-1"
      ${previewMode ? 'aria-hidden="true" role="presentation"' : ''}
      style="
        --wa-gradient:${escapeHtml(gradient)};
        --wa-stroke-color:${escapeHtml(preset.stroke)};
        --wa-stroke-width:${escapeHtml(preset.strokeWidth)}px;
        font-family:${escapeHtml(preset.family)};
        font-size:${escapeHtml(fontSize)}px;
        font-weight:${escapeHtml(preset.weight)};
        letter-spacing:${escapeHtml(preset.spacing)}px;
      "
    ><span contenteditable="false" draggable="false">${finalText}</span></${chosenTag}>
  `;
}

function renderWordArtPreviewMarkup(state) {
  return renderWordArtMarkup({
    ...state,
    tag: 'div',
    previewMode: true,
  });
}

function showWordArtPicker(editor, initialText = 'Word Art') {
  ensurePickerStyles();

  return new Promise((resolve) => {
    const modalHost = editor.modalHost;
    if (!modalHost) {
      resolve(null);
      return;
    }

    let selectedPreset = editor._lastWordArtPreset || WORD_ART_PRESETS[0].value;

    modalHost.hidden = false;
    modalHost.innerHTML = '';

    const overlay = document.createElement('div');
    overlay.className = 'mnb-modal-overlay';
    overlay.setAttribute('contenteditable', 'false');

    const shell = document.createElement('div');
    shell.className = 'mnb-wa-picker';
    shell.setAttribute('contenteditable', 'false');
    shell.setAttribute('spellcheck', 'false');
    shell.innerHTML = `
      <div class="mnb-wa-head">
        <div>
          <h3>Word Art presets</h3>
          <p>Pick a ready-made style, preview it live, then insert it into the editor.</p>
        </div>
        <button type="button" class="mnb-wa-close" aria-label="Close">×</button>
      </div>
      <div class="mnb-wa-controls">
        <label class="mnb-wa-field">
          <span>Text</span>
          <input type="text" name="text" value="${escapeHtml(initialText || 'Word Art')}">
        </label>
        <label class="mnb-wa-field">
          <span>Tag</span>
          <select name="tag">
            <option value="div">div</option>
            <option value="h1">h1</option>
            <option value="h2">h2</option>
            <option value="p">p</option>
            <option value="span">span</option>
          </select>
        </label>
        <label class="mnb-wa-field">
          <span>Size</span>
          <input type="number" name="fontSize" min="18" max="180" step="1" value="64">
        </label>
        <label class="mnb-wa-field">
          <span>Uppercase</span>
          <select name="uppercase">
            <option value="true" selected>Yes</option>
            <option value="false">No</option>
          </select>
        </label>
      </div>
      <div class="mnb-wa-stage">
        <div class="mnb-wa-preview"></div>
      </div>
      <div class="mnb-wa-grid-wrap">
        <div class="mnb-wa-grid-title">
          <strong>Choose a style</strong>
          <span>${WORD_ART_PRESETS.length} presets</span>
        </div>
        <div class="mnb-wa-grid"></div>
      </div>
      <div class="mnb-wa-foot">
        <div class="mnb-wa-tip">Tip: select text in the editor first, then open Word Art to use it as the preview text.</div>
        <div class="mnb-wa-actions">
          <button type="button" class="mnb-btn secondary" data-action="cancel">Cancel</button>
          <button type="button" class="mnb-btn primary" data-action="insert">Insert Word Art</button>
        </div>
      </div>
    `;

    shell.addEventListener('mousedown', (event) => {
      event.stopPropagation();
    });

    shell.addEventListener('click', (event) => {
      event.stopPropagation();
    });

    overlay.appendChild(shell);
    modalHost.appendChild(overlay);

    const textInput = shell.querySelector('[name="text"]');
    const tagSelect = shell.querySelector('[name="tag"]');
    const sizeInput = shell.querySelector('[name="fontSize"]');
    const uppercaseSelect = shell.querySelector('[name="uppercase"]');
    const preview = shell.querySelector('.mnb-wa-preview');
    const grid = shell.querySelector('.mnb-wa-grid');
    const insertButton = shell.querySelector('[data-action="insert"]');

    function close(result = null) {
      modalHost.hidden = true;
      modalHost.innerHTML = '';
      resolve(result);
    }

    function getState() {
      return {
        text: textInput.value || 'Word Art',
        tag: tagSelect.value || 'div',
        fontSize: clamp(sizeInput.value, 18, 180),
        uppercase: uppercaseSelect.value === 'true',
        preset: getPresetByValue(selectedPreset),
      };
    }

    function updatePreview() {
      const state = getState();
      preview.innerHTML = renderWordArtPreviewMarkup(state);

      grid.querySelectorAll('.mnb-wa-card').forEach((card) => {
        card.classList.toggle('is-active', card.dataset.value === selectedPreset);
      });
    }

    WORD_ART_PRESETS.forEach((preset) => {
      const card = document.createElement('button');
      card.type = 'button';
      card.className = 'mnb-wa-card';
      card.dataset.value = preset.value;

      card.innerHTML = `
        <div class="mnb-wa-card-head">
          <strong>${escapeHtml(preset.label)}</strong>
          <span>${escapeHtml(preset.note)}</span>
        </div>
        <div class="mnb-wa-swatches">
          ${preset.colors.map((color) => `<i style="background:${escapeHtml(color)}"></i>`).join('')}
        </div>
        <div class="mnb-wa-sample">
          ${renderWordArtPreviewMarkup({
            text: 'Sample',
            preset,
            fontSize: 34,
            uppercase: true,
          })}
        </div>
      `;

      card.addEventListener('click', () => {
        selectedPreset = preset.value;
        updatePreview();
      });

      grid.appendChild(card);
    });

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close(null);
    });

    shell.querySelector('.mnb-wa-close').addEventListener('click', () => close(null));
    shell.querySelector('[data-action="cancel"]').addEventListener('click', () => close(null));

    insertButton.addEventListener('click', () => {
      const state = getState();
      editor._lastWordArtPreset = state.preset.value;
      close(state);
    });

    [textInput, tagSelect, sizeInput, uppercaseSelect].forEach((input) => {
      input.addEventListener('input', updatePreview);
      input.addEventListener('change', updatePreview);
    });

    shell.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close(null);
      }

      if (event.key === 'Enter' && event.target === textInput) {
        event.preventDefault();
        const state = getState();
        editor._lastWordArtPreset = state.preset.value;
        close(state);
      }
    });

    requestAnimationFrame(() => {
      updatePreview();
      textInput.focus();
      textInput.select();
    });
  });
}

export default buttonTool({
  id: 'word-art',
  label: 'Word Art',
  icon: '𝓦',
  title: 'Word Art',
  async run(editor) {
    editor.captureSelection();
    const insertionRange = cloneEditorRange(editor);

    const picked = await showWordArtPicker(editor, editor.getSelectedText() || 'Word Art');
    if (!picked) return;

    editor.insertHTML(renderWordArtMarkup(picked), insertionRange);
    editor.alert(`${picked.preset.label} inserted.`, 'success');
  },
});