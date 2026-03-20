import { buttonTool } from '../core/toolkit.js';
export default buttonTool({
  id: 'justify',
  label: 'Justify',
  icon: '☷',
  title: 'Justify',
  run(editor) {
    editor.applyBlockStyle({ textAlign: 'justify' });
    editor.alert('Justify applied.', 'success');
  },
});
