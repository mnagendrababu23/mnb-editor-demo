import { selectTool } from '../core/toolkit.js';

const options = [
  { label: 'Paragraph', value: 'P' },
  { label: 'H1', value: 'H1' },
  { label: 'H2', value: 'H2' },
  { label: 'H3', value: 'H3' },
  { label: 'H4', value: 'H4' },
  { label: 'H5', value: 'H5' },
  { label: 'H6', value: 'H6' },
  { label: 'Blockquote', value: 'BLOCKQUOTE' },
  { label: 'Code Block', value: 'PRE' },
];

export default selectTool({
  id: 'block-styles',
  label: 'Block Style',
  title: 'Block Styles',
  value: 'P',
  options,
  run(editor, value) {
    const selected = options.find((item) => item.value === value);
    const label = selected?.label || value;

    editor.exec('formatBlock', value, 'block-style');
    editor.alert(`Block style changed to ${label}.`, 'success');
  },
});