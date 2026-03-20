import { buttonTool } from '../core/toolkit.js';

const SPACE_AFTER_OPTIONS = [
  { label: '0 px', value: '0', icon: '⤓' },
  { label: '4 px', value: '4', icon: '⤓' },
  { label: '8 px', value: '8', icon: '⤓' },
  { label: '12 px', value: '12', icon: '⤓' },
  { label: '16 px', value: '16', icon: '⤓' },
  { label: '20 px', value: '20', icon: '⤓' },
  { label: '24 px', value: '24', icon: '⤓' },
  { label: '32 px', value: '32', icon: '⤓' },
  { label: '40 px', value: '40', icon: '⤓' },
  { label: '48 px', value: '48', icon: '⤓' },
  { label: '64 px', value: '64', icon: '⤓' },
  { label: '80 px', value: '80', icon: '⤓' },
  { label: '100 px', value: '100', icon: '⤓' },
  { label: '120 px', value: '120', icon: '⤓' },
  { label: '160 px', value: '160', icon: '⤓' },
  { label: '200 px', value: '200', icon: '⤓' },
];

export default buttonTool({
  id: 'space-after',
  label: 'Space After',
  icon: '⤓',
  title: 'Add Space After Block',
  hideMenuHeader: true,
  commandMenu: true,
  persistValue: true,
  menuColumns: 1,
  value: '12',
  options: SPACE_AFTER_OPTIONS,
  run(editor, value) {
    if (value == null || value === '') return;

    editor.applyBlockStyle({ marginBottom: `${value}px` });
    editor.alert(`Space after set to ${value}px.`, 'success');
    return value;
  },
});