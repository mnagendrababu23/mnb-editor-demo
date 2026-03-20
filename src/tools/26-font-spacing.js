import { buttonTool } from '../core/toolkit.js';

const SPACING_OPTIONS = [
  { label: '0 px', value: '0', icon: '↔' },
  { label: '0.5 px', value: '0.5', icon: '↔' },
  { label: '1 px', value: '1', icon: '↔' },
  { label: '1.5 px', value: '1.5', icon: '↔' },
  { label: '2 px', value: '2', icon: '↔' },
  { label: '3 px', value: '3', icon: '↔' },
  { label: '4 px', value: '4', icon: '↔' },
  { label: '5 px', value: '5', icon: '↔' },
  { label: '6 px', value: '6', icon: '↔' },
  { label: '8 px', value: '8', icon: '↔' },
  { label: '10 px', value: '10', icon: '↔' },
  { label: '12 px', value: '12', icon: '↔' },
  { label: '16 px', value: '16', icon: '↔' },
  { label: '20 px', value: '20', icon: '↔' },
];

export default buttonTool({
  id: 'font-spacing',
  label: 'Letter Spacing',
  icon: '⟷',
  title: 'Font Spacing',
  hideMenuHeader: true,
  commandMenu: true,
  persistValue: true,
  menuColumns: 1,
  value: '1',
  options: SPACING_OPTIONS,
  run(editor, value) {
    if (value == null || value === '') return;

    editor.surroundSelection('span', {
      styles: { letterSpacing: `${value}px` },
    });

    editor.alert(`Letter spacing set to ${value}px.`, 'success');
    return value;
  },
});