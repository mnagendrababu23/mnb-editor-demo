import { buttonTool } from '../core/toolkit.js';

export default buttonTool({
  id: 'horizontal-alignment',
  label: 'H Align',
  icon: '↔',
  title: 'Horizontal Alignment',
  async run(editor) {
    const values = await editor.form('Horizontal Alignment', [
      { name: 'align', label: 'Horizontal align', type: 'select', value: 'left', options: [
        { label: 'Left', value: 'left' },
        { label: 'Center', value: 'center' },
        { label: 'Right', value: 'right' },
      ]},
    ]);
    if (!values) return;
    const cssValue = values.align === 'left' ? 'flex-start' : values.align === 'center' ? 'center' : 'flex-end';
    editor.applyBlockStyle({ display: 'flex', alignItems: cssValue });
    editor.alert(`Horizontal alignment set to ${values.align}.`, 'success');
  },
});
