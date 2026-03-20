import { buttonTool } from '../core/toolkit.js';

export default buttonTool({
  id: 'vertical-alignment',
  label: 'V Align',
  icon: '↕',
  title: 'Vertical Alignment',
  async run(editor) {
    const values = await editor.form('Vertical Alignment', [
      { name: 'align', label: 'Vertical align', type: 'select', value: 'top', options: [
        { label: 'Top', value: 'top' },
        { label: 'Center', value: 'center' },
        { label: 'Bottom', value: 'bottom' },
      ]},
    ]);
    if (!values) return;
    const cell = editor.getSelectedCell();
    if (cell) {
      cell.style.verticalAlign = values.align;
    } else {
      const cssValue = values.align === 'top' ? 'flex-start' : values.align === 'center' ? 'center' : 'flex-end';
      editor.applyBlockStyle({ display: 'flex', flexDirection: 'column', justifyContent: cssValue, minHeight: '120px' });
    }
    editor.saveHistory('vertical-alignment');
    editor.alert(`Vertical alignment set to ${values.align}.`, 'success');
  },
});
