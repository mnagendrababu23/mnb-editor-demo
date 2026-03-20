import { buttonTool } from '../core/toolkit.js';
export default buttonTool({
  id: 'print',
  label: 'Print',
  icon: '🖨',
  title: 'Print',
  run(editor) { editor.print(); },
});
