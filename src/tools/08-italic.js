import { buttonTool } from '../core/toolkit.js';

export default buttonTool({
  id: 'italic',
  label: 'Italic',
  icon: 'I',
  title: 'Italic',
  run(editor) {
    editor.exec('italic', null, 'italic');
  },
});