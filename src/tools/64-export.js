import { buttonTool } from '../core/toolkit.js';

export default buttonTool({
  id: 'export-tool',
  label: 'Export',
  icon: '⬇',
  title: 'Export HTML, PDF, Text, JSON',
  async run(editor) {
    const values = await editor.form('Export', [
      { name: 'format', label: 'Format', type: 'select', value: 'html', options: [
        { label: 'HTML', value: 'html' },
        { label: 'Text', value: 'text' },
        { label: 'JSON', value: 'json' },
        { label: 'PDF (print flow)', value: 'pdf' },
      ]},
      { name: 'name', label: 'File name without extension', type: 'text', value: 'mnb-document' },
    ]);
    if (!values) return;
    if (values.format === 'html') editor.download(`${values.name}.html`, editor.getHTML(), 'text/html;charset=utf-8');
    else if (values.format === 'text') editor.download(`${values.name}.txt`, editor.getText(), 'text/plain;charset=utf-8');
    else if (values.format === 'json') editor.download(`${values.name}.json`, JSON.stringify({ html: editor.getHTML(), text: editor.getText() }, null, 2), 'application/json;charset=utf-8');
    else editor.print();
  },
});
