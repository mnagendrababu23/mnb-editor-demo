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
  id: 'shape-fill',
  label: 'Shape Fill',
  icon: '◪',
  title: 'Shape Fill',
  iconOnlyMenu: true,
  persistValue: false,
  menuColumns: 2,
  options: [
    { label: 'Fill', value: 'fill' },
    { label: 'No Fill', value: 'no-fill' },
  ],
  run(editor, value) {
    if (!value) return;

    const state = getShapeToolState(editor);
    state.fill = value === 'fill';
    editor.alert(`Shape fill set to ${state.fill ? 'Fill' : 'No Fill'}.`, 'success');
  },
});