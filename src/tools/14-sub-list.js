import { buttonTool } from '../core/toolkit.js';

export default buttonTool({
  id: 'sub-list',
  label: 'Sub List',
  icon: '↳',
  title: 'Sub List',
  run(editor) {
    editor.exec('indent', null, 'sub-list');
    editor.alert('Sub list / nested indent applied.', 'success');
  },
});
