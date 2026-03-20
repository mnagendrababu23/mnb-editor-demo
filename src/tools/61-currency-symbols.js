import { buttonTool } from '../core/toolkit.js';

const symbols = ['₹','₹ ','$','€','£','¥','₩','₽','₺','₫','₦','₪'];

export default buttonTool({
  id: 'currency-symbols',
  label: 'Currency',
  icon: '₹',
  title: 'Currency Symbols',
  async run(editor) {
    const values = await editor.form('Currency Symbols', [
      { name: 'symbol', label: 'Currency symbol', type: 'select', value: '₹', options: symbols },
    ]);
    if (!values) return;
    editor.insertText(values.symbol);
    editor.alert('Currency symbol inserted.', 'success');
  },
});
