import { buttonTool } from '../core/toolkit.js';
export default buttonTool({
  id: 'remove-format',
  label: 'Clear',
  icon: '⌫',
  title: 'Remove Format',
  run(editor) {
    editor.exec('removeFormat', null, 'remove-format');
    const block = editor.getSelectedBlock();
    block.removeAttribute('style');
    editor.alert('Formatting removed.', 'success');
  },
});
