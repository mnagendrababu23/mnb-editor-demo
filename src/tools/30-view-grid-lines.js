import { buttonTool } from '../core/toolkit.js';
export default buttonTool({
  id: 'view-grid-lines',
  label: 'Grid Lines',
  icon: '#',
  title: 'View Grid Lines',
  run(editor) {
    editor.root.classList.toggle('show-grid-lines');
    editor.gridLinesVisible = editor.root.classList.contains('show-grid-lines');
    editor.alert(editor.gridLinesVisible ? 'Grid lines enabled.' : 'Grid lines disabled.', 'success');
  },
});
