import { selectTool } from '../core/toolkit.js';

export default selectTool({
  id: 'line-height',
  label: 'Line Height',
  title: 'Line Height',
  value: '1.6',
  options: ['1', '1.2', '1.4', '1.6', '1.8', '2', '2.4'],
  run(editor, value) {
    editor.applyBlockStyle({ lineHeight: value });
    editor.alert(`Line height set to ${value}.`, 'success');
  },
});
