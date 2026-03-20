import { buttonTool } from '../core/toolkit.js';
export default buttonTool({
  id: 'redo',
  label: 'Redo',
  icon: '↷',
  title: 'Redo',
  run(editor) { editor.redo(); },
});
