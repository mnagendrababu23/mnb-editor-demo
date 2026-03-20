import { buttonTool } from '../core/toolkit.js';
export default buttonTool({
  id: 'increase-indent',
  label: 'Indent +',
  icon: '⇥',
  title: 'Increase Indent',
  run(editor) {
    const block = editor.getSelectedBlock();
    const current = parseInt(block.style.marginLeft || '0', 10) || 0;
    block.style.marginLeft = `${current + 20}px`;
    editor.saveHistory('increase-indent');
    editor.alert('Indent increased.', 'success');
  },
});
