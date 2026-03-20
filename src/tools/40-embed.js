import { buttonTool } from '../core/toolkit.js';
export default buttonTool({
  id: 'embed',
  label: 'Embed',
  icon: '⧉',
  title: 'Embed',
  async run(editor) {
    const values = await editor.form('Embed Content', [
      { name: 'type', label: 'Embed type', type: 'select', value: 'iframe', options: [
        { label: 'IFrame URL', value: 'iframe' },
        { label: 'Raw HTML', value: 'html' },
      ]},
      { name: 'content', label: 'URL / HTML', type: 'textarea', value: '', rows: 5 },
      { name: 'height', label: 'Height in px', type: 'number', value: '360', min: '120', max: '1200' },
    ]);
    if (!values || !values.content) return;
    if (values.type === 'html') {
      editor.insertHTML(values.content);
    } else {
      editor.insertHTML(`<iframe src="${values.content}" height="${values.height}" style="width:100%;border:0;border-radius:18px;"></iframe>`);
    }
    editor.alert('Embed inserted.', 'success');
  },
});
