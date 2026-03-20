import { buttonTool } from '../core/toolkit.js';

export default buttonTool({
  id: 'full-screen',
  label: 'Fullscreen',
  icon: '⛶',
  title: 'Full Screen',
  run(editor) {
    editor.toggleFullscreen();
  },
});