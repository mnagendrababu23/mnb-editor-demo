import { buttonTool } from '../core/toolkit.js';

const CHARS = ['©','®','™','§','¶','†','‡','•','…','←','→','↑','↓','±','÷','×','∞','≈','≠','≤','≥'];

export default buttonTool({
  id: 'charmap',
  label: 'Charmap',
  icon: 'Ω',
  title: 'Charmap',
  iconOnlyMenu: true,
  persistValue: false,
  menuColumns: 5,
  options: CHARS.map((item) => ({
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
    editor.alert('Character inserted.', 'success');
  },
});