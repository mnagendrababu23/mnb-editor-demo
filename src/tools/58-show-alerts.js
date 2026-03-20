import { buttonTool } from '../core/toolkit.js';

const positions = [
  'top-right',
  'top-left',
  'bottom-left',
  'bottom-right',
  'top-center',
  'bottom-center',
  'center',
];

export default buttonTool({
  id: 'show-alerts',
  label: 'Alerts',
  icon: '🔔',
  title: 'Show Alerts',
  async run(editor) {
    const values = await editor.form('Alert Position', [
      { name: 'position', label: 'Position', type: 'select', value: editor.options.alertPosition, options: positions },
      { name: 'type', label: 'Preview alert type', type: 'select', value: 'info', options: ['info','success','error'] },
    ]);
    if (!values) return;
    editor.setAlertPosition(values.position);
    editor.alert(`This is a ${values.type} alert preview.`, values.type);
  },
});
