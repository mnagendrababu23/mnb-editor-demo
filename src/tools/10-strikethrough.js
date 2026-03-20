import { buttonTool } from '../core/toolkit.js';

export default buttonTool({
  id: 'strike',
  label: 'Strikethrough',
  icon: 'S',
  title: 'Strikethrough',
  run(editor) {
    editor.exec('strikeThrough', null, 'strike');
  },
});