import { buttonTool } from '../core/toolkit.js';

function formatDate(pattern) {
  const date = new Date();

  const tokens = {
    DAY: date.toLocaleString('en-US', { weekday: 'long' }),
    MMMM: date.toLocaleString('en-US', { month: 'long' }),
    MMM: date.toLocaleString('en-US', { month: 'short' }),
    YYYY: String(date.getFullYear()),
    DD: String(date.getDate()).padStart(2, '0'),
    MM: String(date.getMonth() + 1).padStart(2, '0'),
  };

  return pattern.replace(/DAY|MMMM|MMM|YYYY|DD|MM/g, (match) => tokens[match] || match);
}

export default buttonTool({
  id: 'date-formats',
  label: 'Date',
  icon: '📅',
  title: 'Date Formats',
  toolbarIconOnly: true,
  iconOnlyMenu: true,
  persistValue: false,
  menuColumns: 1,
  options: [
    { label: 'DD/MM/YYYY', value: 'DD/MM/YYYY' },
    { label: 'MM/DD/YYYY', value: 'MM/DD/YYYY' },
    { label: 'YYYY-MM-DD', value: 'YYYY-MM-DD' },
    { label: 'DD MMM YYYY', value: 'DD MMM YYYY' },
    { label: 'MMMM DD, YYYY', value: 'MMMM DD, YYYY' },
    { label: 'DAY, DD MMMM YYYY', value: 'DAY, DD MMMM YYYY' },
  ],
  run(editor, value) {
    if (!value) return;
    editor.insertText(formatDate(value));
    editor.alert('Date inserted.', 'success');
  },
});