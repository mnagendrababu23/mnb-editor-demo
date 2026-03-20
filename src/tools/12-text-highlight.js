import { selectTool, renderColorPickerMenu } from '../core/toolkit.js';

const HIGHLIGHTS = [
  '#fef08a', '#fde68a', '#fca5a5', '#f9a8d4', '#c4b5fd',
  '#93c5fd', '#86efac', '#99f6e4', '#fdba74', '#d1d5db',
  '#fff7ae', '#ffec99', '#ffd6a5', '#ffb4a2', '#bde0fe',
  '#caffbf', '#a0e7e5', '#ffc6ff', '#e9edc9', '#e5e5e5',
];

export default selectTool({
  id: 'text-highlight',
  label: 'Highlight',
  icon: '🖍',
  title: 'Text Highlight',
  toolbarVariant: 'color-picker',
  value: '#fef08a',

  async run(editor, value) {
    const color = value || '#fef08a';
    editor.exec('hiliteColor', color, 'text-highlight');
    return color;
  },

  renderMenu(editor, ctx) {
    renderColorPickerMenu(editor, ctx, {
      title: 'Text highlight',
      palette: HIGHLIGHTS,
      defaultValue: '#fef08a',
      autoLabel: 'Default',
      autoValue: '#fef08a',
      allowAuto: true,
      recentStorageKey: 'mnb-recent-colors:text-highlight',
      columns: 5,
    });
  },
});