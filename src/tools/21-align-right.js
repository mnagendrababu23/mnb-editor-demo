import { buttonTool } from '../core/toolkit.js';
export default buttonTool({
  id: 'align-right',
  label: 'Align Right',
  icon: '☰',
  title: 'Align Right',
  run(editor) {
    editor.applyBlockStyle({ textAlign: 'right' });
    editor.alert('Align Right applied.', 'success');
  },
});
