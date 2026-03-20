import { buttonTool } from '../core/toolkit.js';
export default buttonTool({
  id: 'background-linear-gradient',
  label: 'Gradient',
  icon: '🌈',
  title: 'Background Linear Gradient',
  async run(editor) {
    const values = await editor.form('Background Linear Gradient', [
      { name: 'angle', label: 'Angle', type: 'number', value: '90', min: '0', max: '360' },
      { name: 'start', label: 'Start color', type: 'color', value: '#4f46e5' },
      { name: 'end', label: 'End color', type: 'color', value: '#ec4899' },
    ]);
    if (!values) return;
    editor.applyBlockStyle({
      backgroundImage: `linear-gradient(${values.angle}deg, ${values.start}, ${values.end})`,
      color: '#ffffff',
      padding: '16px',
      borderRadius: '16px',
    });
    editor.alert('Gradient background applied.', 'success');
  },
});
