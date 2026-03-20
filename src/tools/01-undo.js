import { buttonTool } from '../core/toolkit.js';
export default buttonTool({
  id: 'undo',
  label: 'Undo',
  icon: '↶',
  title: 'Undo',
  run(editor) { editor.undo(); },
});
