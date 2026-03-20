import { buttonTool } from '../core/toolkit.js';

export default buttonTool({
  id: 'bold',
  label: 'Bold',
  icon: 'B',
  title: 'Bold',
  run(editor) {
    editor.exec('bold', null, 'bold');
  },
});