import { buttonTool } from '../core/toolkit.js';

const SPACE_BEFORE_OPTIONS = [
  { label: '0 px', value: '0' },
  { label: '4 px', value: '4' },
  { label: '8 px', value: '8' },
  { label: '12 px', value: '12' },
  { label: '16 px', value: '16' },
  { label: '20 px', value: '20' },
  { label: '24 px', value: '24' },
  { label: '32 px', value: '32' },
  { label: '40 px', value: '40' },
  { label: '48 px', value: '48' },
  { label: '64 px', value: '64' },
  { label: '80 px', value: '80' },
  { label: '100 px', value: '100' },
  { label: '120 px', value: '120' },
  { label: '160 px', value: '160' },
  { label: '200 px', value: '200' },
];

export default buttonTool({
  id: 'space-before',
  label: 'Space Before',
  icon: '⤒',
  title: 'Add Space Before Block',
  persistValue: true,
  menuColumns: 1,
  value: '12',
  options: SPACE_BEFORE_OPTIONS,
  run(editor, value) {
    if (value == null || value === '') return;

    editor.applyBlockStyle({ marginTop: `${value}px` });
    editor.alert(`Space before set to ${value}px.`, 'success');
    return value;
  },
});