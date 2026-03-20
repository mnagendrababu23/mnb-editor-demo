import { buttonTool } from '../core/toolkit.js';
export default buttonTool({
  id: 'align-center',
  label: 'Align Center',
  icon: '≣',
  title: 'Align Center',
  run(editor) {
    editor.applyBlockStyle({ textAlign: 'center' });
    editor.alert('Align Center applied.', 'success');
  },
});
