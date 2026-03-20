import { buttonTool } from '../core/toolkit.js';
export default buttonTool({
  id: 'margins-padding',
  label: 'Box Space',
  icon: '⬚',
  title: 'Margins & Paddings',
  async run(editor) {
    const values = await editor.form('Margins & Paddings', [
      { name: 'margin', label: 'Margin in px', type: 'number', value: '0', min: '0', max: '200' },
      { name: 'padding', label: 'Padding in px', type: 'number', value: '0', min: '0', max: '200' },
    ]);
    if (!values) return;
    editor.applyBlockStyle({ margin: `${values.margin}px`, padding: `${values.padding}px` });
    editor.alert('Margins and padding updated.', 'success');
  },
});
