import { buttonTool } from '../core/toolkit.js';

const SORTABLE_BLOCK_SELECTOR =
  'p,h1,h2,h3,h4,h5,h6,blockquote,pre,div,section,article';

function getSortText(node) {
  return String(node?.textContent || '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLocaleLowerCase();
}

function compareNodes(a, b) {
  return getSortText(a).localeCompare(getSortText(b), undefined, {
    numeric: true,
    sensitivity: 'base',
  });
}

export default buttonTool({
  id: 'sort',
  label: 'Sort',
  icon: '⇅',
  title: 'Sort',
  async run(editor) {
    const values = await editor.form('Sort Items', [
      {
        name: 'direction',
        label: 'Direction',
        type: 'select',
        value: 'asc',
        options: [
          { label: 'Ascending', value: 'asc' },
          { label: 'Descending', value: 'desc' },
        ],
      },
    ]);

    if (!values) return;

    const block = editor.getSelectedBlock();

    // 1) Sort list items without destroying nested formatting/content
    const listItem = block?.closest?.('li');
    const list = listItem?.parentElement?.matches('ul,ol')
      ? listItem.parentElement
      : block?.closest?.('ul,ol');

    if (list) {
      const items = [...list.children].filter((child) => child.matches('li'));

      if (items.length < 2) {
        editor.alert('Need at least 2 list items to sort.', 'info');
        return;
      }

      items.sort(compareNodes);
      if (values.direction === 'desc') items.reverse();

      items.forEach((item) => list.appendChild(item));

      editor.saveHistory('sort-list');
      editor.alert(`List sorted ${values.direction}.`, 'success');
      return;
    }

    // 2) Sort sibling blocks as DOM nodes, preserving HTML/design
    const container = block?.parentElement;

    if (!container) {
      editor.alert('Nothing to sort here.', 'info');
      return;
    }

    const blocks = [...container.children].filter((child) =>
      child.matches(SORTABLE_BLOCK_SELECTOR)
    );

    if (blocks.length < 2) {
      editor.alert('Need at least 2 blocks in the same section to sort.', 'info');
      return;
    }

    blocks.sort(compareNodes);
    if (values.direction === 'desc') blocks.reverse();

    blocks.forEach((item) => container.appendChild(item));

    editor.saveHistory('sort-blocks');
    editor.alert(`Blocks sorted ${values.direction}.`, 'success');
  },
});