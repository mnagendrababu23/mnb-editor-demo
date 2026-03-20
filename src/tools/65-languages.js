import { buttonTool } from '../core/toolkit.js';
const languages = ['en','hi','te','ta','kn','ml','mr','bn','gu','pa','ur','fr','de','es','ar','ja','zh'];

export default buttonTool({
  id: 'languages',
  label: 'Language',
  icon: '🌐',
  title: 'Languages',
  async run(editor) {
    const values = await editor.form('Set Language', [
      { name: 'lang', label: 'Language code', type: 'select', value: 'en', options: languages },
      { name: 'scope', label: 'Apply to', type: 'select', value: 'document', options: [
        { label: 'Entire document', value: 'document' },
        { label: 'Selected block', value: 'block' },
      ]},
    ]);
    if (!values) return;
    if (values.scope === 'document') editor.surface.setAttribute('lang', values.lang);
    else editor.getSelectedBlock().setAttribute('lang', values.lang);
    editor.saveHistory('language-change');
    editor.alert(`Language set to ${values.lang}.`, 'success');
  },
});
