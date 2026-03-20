import { buttonTool } from '../core/toolkit.js';
export default buttonTool({
  id: 'layout',
  label: 'Layout',
  icon: '▥',
  title: 'Layout',
  async run(editor) {
    const values = await editor.form('Insert Layout', [
      { name: 'columns', label: 'Columns', type: 'select', value: '2', options: [
        { label: '2 Columns', value: '2' },
        { label: '3 Columns', value: '3' },
      ]},
    ]);
    if (!values) return;
    if (values.columns === '2') {
      editor.insertHTML(`
        <div class="mnb-columns two">
          <div class="mnb-card"><p>Column 1</p></div>
          <div class="mnb-card"><p>Column 2</p></div>
        </div>
      `);
    } else {
      editor.insertHTML(`
        <div class="mnb-columns three">
          <div class="mnb-card"><p>Column 1</p></div>
          <div class="mnb-card"><p>Column 2</p></div>
          <div class="mnb-card"><p>Column 3</p></div>
        </div>
      `);
    }
    editor.alert('Layout inserted.', 'success');
  },
});
