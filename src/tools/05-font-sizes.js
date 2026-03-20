import { selectTool } from '../core/toolkit.js';

export default selectTool({
  id: 'font-sizes',
  label: 'Font Size',
  title: 'Font Sizes',
  value: '16px',
  options: ['12px', '14px', '16px', '18px', '20px', '24px', '28px', '32px', '40px'],
  run(editor, value) {
    editor.surroundSelection('span', {
      styles: { fontSize: value },
      reason: `font-size-${value}`,
    });
    editor.alert(`Font size set to ${value}.`, 'success');
  },
});