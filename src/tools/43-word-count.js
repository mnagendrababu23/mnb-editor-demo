import { buttonTool } from '../core/toolkit.js';

export default buttonTool({
  id: 'word-count',
  label: 'Word Count',
  icon: '123',
  title: 'Word Count',
  async run(editor) {
    const text = editor.getText();
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    await editor.form('Word Count', [
      { name: 'words', label: 'Words', type: 'text', value: String(words) },
      { name: 'chars', label: 'Characters', type: 'text', value: String(chars) },
    ], { submitText: 'Close' });
  },
});
