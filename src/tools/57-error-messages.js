import { buttonTool } from '../core/toolkit.js';
export default buttonTool({
  id: 'error-messages',
  label: 'Errors',
  icon: '⚠',
  title: 'Error Messages',
  run(editor) {
    editor.debugErrors = !editor.debugErrors;
    editor.alert(editor.debugErrors ? 'Console error logging enabled.' : 'Console error logging disabled.', 'success');
    editor.log('info', `Console error logging ${editor.debugErrors ? 'enabled' : 'disabled'}`);
  },
});
