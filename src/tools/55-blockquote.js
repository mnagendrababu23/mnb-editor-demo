import { buttonTool } from '../core/toolkit.js';
export default buttonTool({
  id: 'blockquote',
  label: 'Blockquote',
  icon: '❝',
  title: 'Blockquote',
  run(editor) {
    editor.exec('formatBlock', 'BLOCKQUOTE', 'blockquote');
    editor.alert('Blockquote applied.', 'success');
  },
});
