import { buttonTool } from '../core/toolkit.js';

const DEFAULT_COLOR = '#4f46e5';
const DEFAULT_SIZE = 120;
const SHAPE_STYLE_ID = 'mnb-shape-tool-styles';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function escapeAttr(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('"', '&quot;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;');
}

function shapeMarkup(kind, color = DEFAULT_COLOR) {
  const stroke = color;
  const strokeWidth = 8;
  const common = `fill="none" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linejoin="round" stroke-linecap="round"`;

  if (kind === 'rectangle') {
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"><rect x="12" y="12" width="76" height="76" rx="2" ${common} /></svg>`;
  }

  if (kind === 'rounded-rectangle') {
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"><rect x="12" y="12" width="76" height="76" rx="14" ${common} /></svg>`;
  }

  if (kind === 'circle') {
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"><circle cx="50" cy="50" r="38" ${common} /></svg>`;
  }

  if (kind === 'ellipse') {
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"><ellipse cx="50" cy="50" rx="38" ry="28" ${common} /></svg>`;
  }

  if (kind === 'triangle') {
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"><polygon points="50,12 88,86 12,86" ${common} /></svg>`;
  }

  if (kind === 'diamond') {
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"><polygon points="50,10 90,50 50,90 10,50" ${common} /></svg>`;
  }

  if (kind === 'pentagon') {
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"><polygon points="50,10 88,38 74,86 26,86 12,38" ${common} /></svg>`;
  }

  if (kind === 'hexagon') {
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"><polygon points="30,10 70,10 90,50 70,90 30,90 10,50" ${common} /></svg>`;
  }

  if (kind === 'star') {
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"><polygon points="50,8 61,36 91,36 67,54 76,84 50,66 24,84 33,54 9,36 39,36" ${common} /></svg>`;
  }

  if (kind === 'heart') {
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"><path d="M50 84 L18 52 C8 42 8 24 24 18 C34 14 44 20 50 30 C56 20 66 14 76 18 C92 24 92 42 82 52 Z" ${common} /></svg>`;
  }

  if (kind === 'arrow-right') {
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"><path d="M12 50 H74 M56 30 L76 50 L56 70" ${common} /></svg>`;
  }

  if (kind === 'arrow-left') {
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"><path d="M88 50 H26 M44 30 L24 50 L44 70" ${common} /></svg>`;
  }

  if (kind === 'line') {
    return `<svg viewBox="0 0 100 50" preserveAspectRatio="xMidYMid meet"><line x1="10" y1="25" x2="90" y2="25" ${common} /></svg>`;
  }

  return `<svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet"><rect x="12" y="12" width="76" height="76" rx="2" ${common} /></svg>`;
}

function shapeWrapperMarkup(kind, color = DEFAULT_COLOR, size = DEFAULT_SIZE) {
  const safeSize = clamp(Number(size) || DEFAULT_SIZE, 24, 640);

  return `
    <span
      class="mnb-shape-box"
      contenteditable="false"
      data-shape-kind="${escapeAttr(kind)}"
      data-shape-color="${escapeAttr(color)}"
      style="width:${safeSize}px;"
    >
      ${shapeMarkup(kind, color)}
      <span class="mnb-shape-resizer" contenteditable="false"></span>
    </span>
  `;
}

function injectShapeStyles() {
  if (document.getElementById(SHAPE_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = SHAPE_STYLE_ID;
  style.textContent = `
    .mnb-shape-box{
      position:relative;
      display:inline-block;
      vertical-align:middle;
      line-height:0;
      margin:4px 2px;
      max-width:100%;
      user-select:none;
      cursor:pointer;
    }

    .mnb-shape-box svg{
      display:block;
      width:100%;
      height:auto;
      pointer-events:none;
      overflow:visible;
    }

    .mnb-shape-box .mnb-shape-resizer{
      position:absolute;
      right:-8px;
      bottom:-8px;
      width:14px;
      height:14px;
      border-radius:999px;
      background:#2563eb;
      border:2px solid #ffffff;
      box-shadow:0 2px 8px rgba(15,23,42,.18);
      cursor:nwse-resize;
      display:none;
    }

    .mnb-shape-box.is-selected{
      outline:2px solid #2563eb;
      outline-offset:3px;
      border-radius:6px;
    }

    .mnb-shape-box.is-selected .mnb-shape-resizer{
      display:block;
    }
  `;
  document.head.appendChild(style);
}

function getSelectedShape(editor) {
  const node = editor.__mnbSelectedShape;
  if (!node) return null;
  if (!editor.surface || !editor.surface.contains(node)) return null;
  return node;
}

function deselectShape(editor) {
  const selected = getSelectedShape(editor);
  if (!selected) {
    editor.__mnbSelectedShape = null;
    return;
  }

  selected.classList.remove('is-selected');
  editor.__mnbSelectedShape = null;
}

function selectShape(editor, box) {
  if (!box || !editor.surface?.contains(box)) return null;

  const current = getSelectedShape(editor);
  if (current && current !== box) {
    current.classList.remove('is-selected');
  }

  box.classList.add('is-selected');
  editor.__mnbSelectedShape = box;
  return box;
}

function installShapeInteractions(editor) {
  if (editor.__mnbShapeToolInstalled) return;
  editor.__mnbShapeToolInstalled = true;

  injectShapeStyles();

  const surface = editor.surface;
  if (!surface) return;

  const beginResize = (event, box) => {
    event.preventDefault();
    event.stopPropagation();

    selectShape(editor, box);

    const startX = event.clientX;
    const startWidth = box.getBoundingClientRect().width;
    const surfaceRect = surface.getBoundingClientRect();
    const maxWidth = Math.max(80, Math.floor(surfaceRect.width - 24));

    document.body.style.userSelect = 'none';

    let didResize = false;

    const onMove = (moveEvent) => {
      const dx = moveEvent.clientX - startX;
      const nextWidth = clamp(Math.round(startWidth + dx), 24, maxWidth);
      box.style.width = `${nextWidth}px`;
      didResize = true;
    };

    const onUp = () => {
      document.body.style.userSelect = '';
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onUp);

      if (didResize) {
        editor.saveHistory('shape-resize');
        editor.refreshStatus();
      }
    };

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
  };

  surface.addEventListener('mousedown', (event) => {
    const handle = event.target.closest('.mnb-shape-resizer');
    if (handle) {
      const box = handle.closest('.mnb-shape-box');
      if (box) beginResize(event, box);
      return;
    }

    const box = event.target.closest('.mnb-shape-box');
    if (box && surface.contains(box)) {
      event.preventDefault();
      selectShape(editor, box);
      return;
    }

    deselectShape(editor);
  });

  surface.addEventListener('click', (event) => {
    const box = event.target.closest('.mnb-shape-box');
    if (box && surface.contains(box)) {
      event.preventDefault();
      selectShape(editor, box);
    }
  });

  document.addEventListener('mousedown', (event) => {
    if (!editor.root?.contains(event.target)) {
      deselectShape(editor);
    }
  });

  document.addEventListener('keydown', (event) => {
    const selected = getSelectedShape(editor);
    if (!selected) return;

    if (event.key === 'Delete' || event.key === 'Backspace') {
      event.preventDefault();
      selected.remove();
      editor.__mnbSelectedShape = null;
      editor.saveHistory('shape-delete');
      editor.refreshStatus();
      editor.alert('Shape removed.', 'success');
      return;
    }

    if (event.key === 'Escape') {
      deselectShape(editor);
    }
  });
}

export default buttonTool({
  id: 'insert-shapes',
  label: 'Shapes',
  icon: '⬠',
  title: 'Insert Shapes',
  iconOnlyMenu: true,
  persistValue: false,
  menuColumns: 3,

  options: [
    { label: '▭', value: 'rectangle' },
    { label: '▢', value: 'rounded-rectangle' },
    { label: '◯', value: 'circle' },
    { label: '⬭', value: 'ellipse' },
    { label: '△', value: 'triangle' },
    { label: '◇', value: 'diamond' },
    { label: '⬟', value: 'pentagon' },
    { label: '⬡', value: 'hexagon' },
    { label: '★', value: 'star' },
    { label: '♥', value: 'heart' },
    { label: '→', value: 'arrow-right' },
    { label: '←', value: 'arrow-left' },
    { label: '／', value: 'line' },
  ],

  onRendered(editor) {
    installShapeInteractions(editor);
  },

  async run(editor, value) {
    if (!value) return;

    installShapeInteractions(editor);

    const values = await editor.form('Insert Shape', [
      {
        name: 'size',
        label: 'Size (px)',
        type: 'number',
        value: DEFAULT_SIZE,
        min: 24,
        max: 640,
        step: 2,
      },
      {
        name: 'color',
        label: 'Stroke color',
        type: 'color',
        value: DEFAULT_COLOR,
      },
    ]);

    if (!values) return;

    editor.insertHTML(
      shapeWrapperMarkup(
        value,
        values.color || DEFAULT_COLOR,
        Number(values.size) || DEFAULT_SIZE
      )
    );

    deselectShape(editor);

    const inserted = editor.surface?.querySelector('.mnb-shape-box:last-of-type');
    if (inserted) {
      selectShape(editor, inserted);
    }

    editor.alert('Shape inserted.', 'success');
    return value;
  },
});