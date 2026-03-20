import { buttonTool } from '../core/toolkit.js';
export default buttonTool({
  id: 'align-left',
  label: 'Align Left',
  icon: '≡',
  title: 'Align Left',
  run(editor) {
    editor.applyBlockStyle({ textAlign: 'left' });
    editor.alert('Align Left applied.', 'success');
  },
});
