import { buttonTool } from '../core/toolkit.js';
export default buttonTool({
  id: 'show-hide',
  label: 'Show/Hide',
  icon: '👁',
  title: 'Show / Hide',
  run(editor) {
    const block = editor.toggleBlockClass('mnb-hidden-block');
    editor.alert(block.classList.contains('mnb-hidden-block') ? 'Block hidden.' : 'Block shown.', 'success');
  },
});
