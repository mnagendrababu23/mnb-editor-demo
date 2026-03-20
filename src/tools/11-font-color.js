import { selectTool, renderColorPickerMenu } from '../core/toolkit.js';

const COLORS = [
  '#000000', '#434343', '#666666', '#999999', '#b7b7b7',
  '#980000', '#ff0000', '#ff9900', '#ffff00', '#00ff00',
  '#00ffff', '#4a86e8', '#0000ff', '#9900ff', '#ff00ff',
  '#f4cccc', '#fce5cd', '#fff2cc', '#d9ead3', '#d0e0e3',
  '#c9daf8', '#d9d2e9', '#ead1dc', '#f6b26b', '#76a5af',
];

export default selectTool({
  id: 'font-color',
  label: 'Font Color',
  icon: 'A',
  title: 'Font Color',
  toolbarVariant: 'color-picker',
  value: '#111827',

  async run(editor, value) {
    const color = value || '#111827';
    editor.exec('foreColor', color, 'font-color');
    return color;
  },

  renderMenu(editor, ctx) {
    renderColorPickerMenu(editor, ctx, {
      title: 'Text color',
      palette: COLORS,
      defaultValue: '#111827',
      autoLabel: 'Automatic',
      autoValue: '#111827',
      allowAuto: true,
      recentStorageKey: 'mnb-recent-colors:font-color',
      columns: 5,
    });
  },
});