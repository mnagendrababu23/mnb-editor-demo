import { buttonTool } from '../core/toolkit.js';
export default buttonTool({
  id: 'theme',
  label: 'Theme',
  icon: '◐',
  title: 'Theme',
  run(editor) {
    const next = editor.options.theme === 'light' ? 'dark' : 'light';
    editor.setTheme(next);
    editor.alert(`Theme changed to ${next}.`, 'success');
  },
});
