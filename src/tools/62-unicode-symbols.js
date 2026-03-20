import { buttonTool } from '../core/toolkit.js';

const symbols = ['☀','☁','☂','☕','☘','☯','☮','♠','♣','♥','♦','♪','♫','✓','✔','✦','✿','❖','➜','➤'];

export default buttonTool({
  id: 'unicode-symbols',
  label: 'Unicode',
  icon: '☯',
  title: 'Unicode Symbols',
  async run(editor) {
    const values = await editor.form('Unicode Symbols', [
      { name: 'symbol', label: 'Unicode symbol', type: 'select', value: symbols[0], options: symbols },
    ]);
    if (!values) return;
    editor.insertText(values.symbol);
    editor.alert('Unicode symbol inserted.', 'success');
  },
});
