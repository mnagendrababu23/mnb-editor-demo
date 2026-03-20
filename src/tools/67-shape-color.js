import { buttonTool } from '../core/toolkit.js';

const DEFAULT_COLOR = '#4f46e5';
const DEFAULT_SIZE = 120;
const DEFAULT_FILL = false;

function getShapeToolState(editor) {
  if (!editor.__shapeToolState) {
    editor.__shapeToolState = {
      color: DEFAULT_COLOR,
      size: DEFAULT_SIZE,
      fill: DEFAULT_FILL,
    };
  }
  return editor.__shapeToolState;
}

export default buttonTool({
  id: 'shape-color',
  label: 'Shape Color',
  icon: '🎨',
  title: 'Shape Color',
  iconOnlyMenu: true,
  persistValue: false,
  menuColumns: 3,
  options: [
    { label: 'Indigo', value: '#4f46e5' },
    { label: 'Blue', value: '#2563eb' },
    { label: 'Sky', value: '#0ea5e9' },
    { label: 'Green', value: '#16a34a' },
    { label: 'Emerald', value: '#10b981' },
    { label: 'Yellow', value: '#eab308' },
    { label: 'Orange', value: '#f97316' },
    { label: 'Red', value: '#dc2626' },
    { label: 'Pink', value: '#ec4899' },
    { label: 'Purple', value: '#9333ea' },
    { label: 'Black', value: '#111827' },
    { label: 'Gray', value: '#6b7280' },
  ],
  run(editor, value) {
    if (!value) return;

    const state = getShapeToolState(editor);
    state.color = value;
    editor.alert('Shape color updated.', 'success');
  },
});