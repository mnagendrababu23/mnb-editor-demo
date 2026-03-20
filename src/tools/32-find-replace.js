import { buttonTool } from '../core/toolkit.js';

function escapeRegExp(value = '') {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function countMatches(source = '', regex) {
  const flags = regex.flags.includes('g') ? regex.flags : `${regex.flags}g`;
  const safeRegex = new RegExp(regex.source, flags);
  const matches = source.match(safeRegex);
  return matches ? matches.length : 0;
}

export default buttonTool({
  id: 'find-replace',
  label: 'Find & Replace',
  icon: '🔎',
  title: 'Find & Replace',
  async run(editor) {
    const selectedText = (editor.getSelectedText?.() || '').trim();

    const values = await editor.form(
      'Find & Replace',
      [
        {
          name: 'find',
          label: 'Find text',
          type: 'text',
          value: selectedText,
          placeholder: 'Enter text to find',
        },
        {
          name: 'replace',
          label: 'Replace with',
          type: 'text',
          value: '',
          placeholder: 'Leave empty to remove matches',
        },
        {
          name: 'matchMode',
          label: 'Match mode',
          type: 'select',
          value: 'ignore-case',
          options: [
            { label: 'Ignore case', value: 'ignore-case' },
            { label: 'Match case exactly', value: 'match-case' },
          ],
        },
        {
          name: 'action',
          label: 'Replace mode',
          type: 'select',
          value: 'all',
          options: [
            { label: 'Replace all matches', value: 'all' },
            { label: 'Replace first match only', value: 'first' },
          ],
        },
      ],
      { submitText: 'Replace' }
    );

    if (!values) return;

    const findText = String(values.find || '').trim();
    const replaceText = String(values.replace || '');
    const matchCase = values.matchMode === 'match-case';
    const replaceAll = values.action === 'all';

    if (!findText) {
      editor.alert('Please enter text to find.', 'error');
      return;
    }

    const html = editor.getHTML?.() || '';
    const escapedFind = escapeRegExp(findText);
    const flags = `${replaceAll ? 'g' : ''}${matchCase ? '' : 'i'}`;
    const regex = new RegExp(escapedFind, flags);

    const totalMatches = countMatches(
      html,
      new RegExp(escapedFind, matchCase ? 'g' : 'gi')
    );

    if (!totalMatches) {
      editor.alert(`No matches found for "${findText}".`, 'info');
      return;
    }

    const nextHtml = html.replace(regex, replaceText);
    editor.setHTML(nextHtml);

    const replacedCount = replaceAll ? totalMatches : 1;
    const label = replacedCount === 1 ? 'match' : 'matches';

    editor.alert(
      `Replaced ${replacedCount} ${label} for "${findText}".`,
      'success'
    );
  },
});