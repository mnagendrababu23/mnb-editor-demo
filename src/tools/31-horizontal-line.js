import { buttonTool } from '../core/toolkit.js';
export default buttonTool({
  id: 'horizontal-line',
  label: 'Horizontal Line',
  icon: '—',
  title: 'Horizontal Line',
  run(editor) {
    editor.insertHTML('<hr>');
    editor.alert('Horizontal line inserted.', 'success');
  },
});
