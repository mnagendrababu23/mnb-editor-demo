import { buttonTool } from '../core/toolkit.js';

export default buttonTool({
  id: 'underline',
  label: 'Underline',
  icon: 'U',
  title: 'Underline',
  run(editor) {
    editor.exec('underline', null, 'underline');
  },
});