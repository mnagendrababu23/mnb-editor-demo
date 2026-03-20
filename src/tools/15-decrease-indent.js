import { buttonTool } from '../core/toolkit.js';
export default buttonTool({
  id: 'decrease-indent',
  label: 'Indent -',
  icon: '⇤',
  title: 'Decrease Indent',
  run(editor) {
    const block = editor.getSelectedBlock();
    const current = parseInt(block.style.marginLeft || '0', 10) || 0;
    block.style.marginLeft = `${Math.max(0, current - 20)}px`;
    editor.saveHistory('decrease-indent');
    editor.alert('Indent decreased.', 'success');
  },
});
