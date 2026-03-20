import { buttonTool } from '../core/toolkit.js';

export default buttonTool({
  id: 'code-sprint',
  label: 'Code Sprint',
  icon: '{}',
  title: 'Code Sprint',
  async run(editor) {
    const values = await editor.form('Code Sprint', [
      { name: 'language', label: 'Language', type: 'select', value: 'javascript', options: [
        'javascript','html','css','php','python','json','sql'
      ]},
      { name: 'code', label: 'Code', type: 'textarea', value: 'console.log("Hello world");', rows: 8 },
    ]);
    if (!values) return;
    editor.insertHTML(`<pre data-language="${values.language}" style="background:#0f172a;color:#e2e8f0;padding:16px;border-radius:16px;overflow:auto"><code>${values.code.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')}</code></pre>`);
    editor.alert('Code block inserted.', 'success');
  },
});
