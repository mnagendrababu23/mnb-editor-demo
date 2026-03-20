import { buttonTool } from '../core/toolkit.js';

const EMOJI = [
  '😀','😁','😂','😊','😍',
  '😎','🤝','👍','🔥','✨',
  '🎉','✅','📌','📎','📢',
  '💡','🚀','❤️','💬','📷'
];

export default buttonTool({
  id: 'emoji',
  label: 'Emoji',
  icon: '😊',
  title: 'Emoji',
  iconOnlyMenu: true,
  persistValue: false,
  menuColumns: 5,
  options: EMOJI.map((item) => ({
    label: item,
    value: item,
    style: {
      fontSize: '22px',
      lineHeight: '1',
    },
  })),
  run(editor, value) {
    if (!value) return;
    editor.insertText(value);
    editor.alert('Emoji inserted.', 'success');
  },
});