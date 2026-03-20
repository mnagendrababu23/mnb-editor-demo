import { selectTool } from '../core/toolkit.js';

function getCell(editor) {
  return editor.getSelectedCell?.() || null;
}

function getRow(editor) {
  return getCell(editor)?.closest?.('tr') || null;
}

function getTable(editor) {
  return getCell(editor)?.closest?.('table') || null;
}

function navButton(label, active, onClick) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = label;
  btn.style.display = 'flex';
  btn.style.alignItems = 'center';
  btn.style.justifyContent = 'space-between';
  btn.style.width = '100%';
  btn.style.padding = '10px 12px';
  btn.style.border = '0';
  btn.style.background = active ? '#2563eb' : 'transparent';
  btn.style.color = active ? '#fff' : '#111827';
  btn.style.cursor = 'pointer';
  btn.style.fontSize = '14px';
  btn.style.textAlign = 'left';
  btn.style.borderRadius = '8px';
  btn.innerHTML = `<span>${label}</span><span style="opacity:.7;">›</span>`;
  btn.addEventListener('click', onClick);
  return btn;
}

function actionButton(label, onClick, { disabled = false, danger = false } = {}) {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = label;
  btn.disabled = disabled;
  btn.style.display = 'block';
  btn.style.width = '100%';
  btn.style.padding = '9px 10px';
  btn.style.border = '1px solid #e5e7eb';
  btn.style.borderRadius = '8px';
  btn.style.background = disabled ? '#f9fafb' : '#fff';
  btn.style.color = disabled ? '#9ca3af' : danger ? '#b91c1c' : '#111827';
  btn.style.cursor = disabled ? 'not-allowed' : 'pointer';
  btn.style.fontSize = '13px';
  btn.style.textAlign = 'left';
  btn.style.marginBottom = '8px';
  btn.addEventListener('click', onClick);
  return btn;
}

function sectionTitle(text) {
  const node = document.createElement('div');
  node.textContent = text;
  node.style.fontSize = '12px';
  node.style.fontWeight = '700';
  node.style.color = '#6b7280';
  node.style.margin = '0 0 10px';
  node.style.textTransform = 'uppercase';
  node.style.letterSpacing = '.04em';
  return node;
}

function divider() {
  const hr = document.createElement('div');
  hr.style.height = '1px';
  hr.style.background = '#e5e7eb';
  hr.style.margin = '10px 0';
  return hr;
}

function renderInsertGrid(panel, onChoose) {
  panel.innerHTML = '';

  const title = document.createElement('div');
  title.textContent = 'Insert table';
  title.style.fontSize = '13px';
  title.style.fontWeight = '700';
  title.style.marginBottom = '10px';

  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(10, 22px)';
  grid.style.gridAutoRows = '22px';
  grid.style.gap = '0';
  grid.style.width = '220px';
  grid.style.borderTop = '1px solid #e5e7eb';
  grid.style.borderLeft = '1px solid #e5e7eb';
  grid.style.background = '#fff';

  const status = document.createElement('div');
  status.textContent = '0 x 0';
  status.style.textAlign = 'center';
  status.style.fontSize = '13px';
  status.style.color = '#6b7280';
  status.style.marginTop = '10px';

  const maxRows = 8;
  const maxCols = 10;
  const cells = [];
  let hoverRows = 0;
  let hoverCols = 0;

  const paint = () => {
    cells.forEach(({ node, row, col }) => {
      const active = row <= hoverRows && col <= hoverCols;
      node.style.background = active ? '#3b82f6' : '#fff';
      node.style.borderRight = '1px solid #e5e7eb';
      node.style.borderBottom = '1px solid #e5e7eb';
    });
    status.textContent = hoverRows && hoverCols ? `${hoverCols} x ${hoverRows}` : '0 x 0';
  };

  for (let row = 1; row <= maxRows; row += 1) {
    for (let col = 1; col <= maxCols; col += 1) {
      const cell = document.createElement('button');
      cell.type = 'button';
      cell.style.width = '22px';
      cell.style.height = '22px';
      cell.style.padding = '0';
      cell.style.margin = '0';
      cell.style.border = '0';
      cell.style.background = '#fff';
      cell.style.cursor = 'pointer';

      cell.addEventListener('mouseenter', () => {
        hoverRows = row;
        hoverCols = col;
        paint();
      });

      cell.addEventListener('click', () => {
        onChoose(row, col);
      });

      cells.push({ node: cell, row, col });
      grid.appendChild(cell);
    }
  }

  grid.addEventListener('mouseleave', () => {
    hoverRows = 0;
    hoverCols = 0;
    paint();
  });

  paint();

  panel.appendChild(title);
  panel.appendChild(grid);
  panel.appendChild(status);
}

function renderActionList(panel, titleText, items) {
  panel.innerHTML = '';
  panel.appendChild(sectionTitle(titleText));
  items.forEach((item) => {
    panel.appendChild(actionButton(item.label, item.onClick, item));
  });
}

export default selectTool({
  id: 'table',
  label: 'Table',
  icon: '▦',
  title: 'Table',
   iconOnlyMenu: true,
  async run(editor, value) {
    const payload = value && typeof value === 'object' ? value : { action: value };
    const action = payload.action;

    const cell = getCell(editor);
    const row = getRow(editor);
    const table = getTable(editor);

    switch (action) {
      case 'insert': {
        const rows = Math.max(1, Number(payload.rows || 1));
        const cols = Math.max(1, Number(payload.cols || 1));
        editor.insertTable(rows, cols);
        editor.alert(`Inserted ${cols} × ${rows} table.`, 'success');
        return;
      }

      case 'add-row':
        if (!row) return editor.alert('Place the caret inside a table row.', 'error');
        editor.addTableRow();
        editor.alert('Row added.', 'success');
        return;

      case 'add-col':
        if (!table) return editor.alert('Place the caret inside a table.', 'error');
        editor.addTableColumn();
        editor.alert('Column added.', 'success');
        return;

      case 'delete-row':
        if (!row) return editor.alert('Place the caret inside a table row.', 'error');
        editor.deleteTableRow();
        editor.alert('Row deleted.', 'success');
        return;

      case 'delete-col':
        if (!table) return editor.alert('Place the caret inside a table.', 'error');
        editor.deleteTableColumn();
        editor.alert('Column deleted.', 'success');
        return;

      case 'merge-right':
        if (!cell) return editor.alert('Place the caret inside a table cell.', 'error');
        if (!cell.nextElementSibling) {
          return editor.alert('Select a cell that has a right-side cell to merge.', 'error');
        }
        editor.mergeCellRight();
        editor.alert('Merged with right cell.', 'success');
        return;

      case 'remove':
        if (!table) return editor.alert('Place the caret inside a table.', 'error');
        editor.removeTable();
        editor.alert('Table removed.', 'success');
        return;

      case 'border-none':
        if (!table) return editor.alert('Place the caret inside a table.', 'error');
        editor.setTableBorderMode('none');
        editor.alert('No borders applied.', 'success');
        return;

      case 'border-all':
        if (!table) return editor.alert('Place the caret inside a table.', 'error');
        editor.setTableBorderMode('all');
        editor.alert('All borders applied.', 'success');
        return;

      case 'border-outside':
        if (!table) return editor.alert('Place the caret inside a table.', 'error');
        editor.setTableBorderMode('outside');
        editor.alert('Outside borders applied.', 'success');
        return;

      case 'border-inside':
        if (!table) return editor.alert('Place the caret inside a table.', 'error');
        editor.setTableBorderMode('inside');
        editor.alert('Inside borders applied.', 'success');
        return;

      case 'border-bottom':
        if (!table) return editor.alert('Place the caret inside a table.', 'error');
        editor.setTableBorderMode('bottom');
        editor.alert('Bottom border applied.', 'success');
        return;

      case 'border-top':
        if (!table) return editor.alert('Place the caret inside a table.', 'error');
        editor.setTableBorderMode('top');
        editor.alert('Top border applied.', 'success');
        return;

      case 'border-left':
        if (!table) return editor.alert('Place the caret inside a table.', 'error');
        editor.setTableBorderMode('left');
        editor.alert('Left border applied.', 'success');
        return;

      case 'border-right':
        if (!table) return editor.alert('Place the caret inside a table.', 'error');
        editor.setTableBorderMode('right');
        editor.alert('Right border applied.', 'success');
        return;
    }
  },

  renderMenu(editor, api) {
    const { menu, close, execute } = api;

    menu.addEventListener('mousedown', (event) => event.preventDefault());

    menu.style.padding = '0';
    menu.style.minWidth = '430px';
    menu.style.overflow = 'hidden';
    menu.style.display = 'grid';
    menu.style.gridTemplateColumns = '170px 1fr';

    const left = document.createElement('div');
    left.style.padding = '10px';
    left.style.borderRight = '1px solid #e5e7eb';
    left.style.background = '#f8fafc';

    const right = document.createElement('div');
    right.style.padding = '12px';
    right.style.background = '#fff';
    right.style.minHeight = '250px';

    menu.appendChild(left);
    menu.appendChild(right);

    let active = 'table';

    const refresh = () => {
      left.innerHTML = '';

      const navItems = [
        { key: 'table', label: 'Table' },
        { key: 'cell', label: 'Cell' },
        { key: 'row', label: 'Row' },
        { key: 'column', label: 'Column' },
        { key: 'sort', label: 'Sort' },
      ];

      navItems.forEach((item) => {
        left.appendChild(navButton(item.label, active === item.key, () => {
          active = item.key;
          refresh();
        }));
      });

      const cell = getCell(editor);
      const row = getRow(editor);
      const table = getTable(editor);

      if (active === 'table') {
        renderInsertGrid(right, async (rows, cols) => {
          await execute({ action: 'insert', rows, cols });
          close();
        });

        right.appendChild(divider());

        right.appendChild(
          actionButton(
            'Delete table',
            async () => {
              await execute({ action: 'remove' });
              close();
            },
            { disabled: !table, danger: true }
          )
        );
      }

      if (active === 'cell') {
        renderActionList(right, 'Cell', [
          {
            label: 'Merge right',
            disabled: !cell || !cell.nextElementSibling,
            onClick: async () => {
              await execute({ action: 'merge-right' });
              close();
            },
          },
          {
            label: 'No borders',
            disabled: !table,
            onClick: async () => {
              await execute({ action: 'border-none' });
              close();
            },
          },
          {
            label: 'All borders',
            disabled: !table,
            onClick: async () => {
              await execute({ action: 'border-all' });
              close();
            },
          },
          {
            label: 'Outside borders',
            disabled: !table,
            onClick: async () => {
              await execute({ action: 'border-outside' });
              close();
            },
          },
          {
            label: 'Inside borders',
            disabled: !table,
            onClick: async () => {
              await execute({ action: 'border-inside' });
              close();
            },
          },
          {
            label: 'Top border',
            disabled: !table,
            onClick: async () => {
              await execute({ action: 'border-top' });
              close();
            },
          },
          {
            label: 'Bottom border',
            disabled: !table,
            onClick: async () => {
              await execute({ action: 'border-bottom' });
              close();
            },
          },
          {
            label: 'Left border',
            disabled: !table,
            onClick: async () => {
              await execute({ action: 'border-left' });
              close();
            },
          },
          {
            label: 'Right border',
            disabled: !table,
            onClick: async () => {
              await execute({ action: 'border-right' });
              close();
            },
          },
        ]);
      }

      if (active === 'row') {
        renderActionList(right, 'Row', [
          {
            label: 'Add row',
            disabled: !row,
            onClick: async () => {
              await execute({ action: 'add-row' });
              close();
            },
          },
          {
            label: 'Delete row',
            disabled: !row,
            danger: true,
            onClick: async () => {
              await execute({ action: 'delete-row' });
              close();
            },
          },
        ]);
      }

      if (active === 'column') {
        renderActionList(right, 'Column', [
          {
            label: 'Add column',
            disabled: !table,
            onClick: async () => {
              await execute({ action: 'add-col' });
              close();
            },
          },
          {
            label: 'Delete column',
            disabled: !table,
            danger: true,
            onClick: async () => {
              await execute({ action: 'delete-col' });
              close();
            },
          },
        ]);
      }

      if (active === 'sort') {
        right.innerHTML = '';
        const note = document.createElement('div');
        note.textContent = 'Sort UI is not wired yet.';
        note.style.fontSize = '13px';
        note.style.color = '#6b7280';
        note.style.padding = '8px 0';
        right.appendChild(sectionTitle('Sort'));
        right.appendChild(note);
      }
    };

    refresh();
  },
});