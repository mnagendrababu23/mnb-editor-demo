import { buttonTool } from '../core/toolkit.js';
export default buttonTool({
  id: 'link',
  label: 'Link',
  icon: '🔗',
  title: 'Link',
  async run(editor) {
    const selected = editor.getSelectedText();
    const values = await editor.form('Insert Link', [
      { name: 'url', label: 'URL', type: 'text', value: 'https://' },
      { name: 'text', label: 'Text', type: 'text', value: selected || 'Link Text' },
      { name: 'newTab', label: 'Open in new tab', type: 'checkbox', value: true },
    ]);
    if (!values || !values.url) return;
    if (selected) {
      editor.exec('createLink', values.url, 'link');
      const range = editor.selectedRange();
      const node = range?.commonAncestorContainer?.parentNode;
      const anchor = node?.closest?.('a') || editor.surface.querySelector(`a[href="${values.url}"]`);
      if (anchor) {
        anchor.textContent = values.text;
        if (values.newTab) {
          anchor.target = '_blank';
          anchor.rel = 'noopener noreferrer';
        }
      }
      editor.saveHistory('link-update');
    } else {
      editor.insertHTML(`<a href="${values.url}" ${values.newTab ? 'target="_blank" rel="noopener noreferrer"' : ''}>${values.text}</a>`);
    }
    editor.alert('Link inserted.', 'success');
  },
});
