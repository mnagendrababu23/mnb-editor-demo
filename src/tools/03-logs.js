import { buttonTool } from '../core/toolkit.js';

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getSeq(item, index) {
  return item?.seq ?? (index + 1);
}

function hasJumpTarget(item) {
  return Boolean(item?.target || item?.data?.targetId);
}

function renderMessageCell(item, index) {
  if (hasJumpTarget(item)) {
    const seq = getSeq(item, index);

    return `
      <button
        type="button"
        class="mnb-log-jump"
        data-seq="${escapeHtml(String(seq))}"
        style="
          background:none;
          border:none;
          padding:0;
          color:#2563eb;
          cursor:pointer;
          text-decoration:underline;
          font:inherit;
          text-align:left;
        "
      >
        click here show
      </button>
    `;
  }

  return escapeHtml(item?.message || '');
}

export default buttonTool({
  id: 'logs',
  label: 'Logs',
  icon: '📝',
  title: 'Logs',
  async run(editor) {
    const rows = editor.logs.length
      ? editor.logs.map((item, index) => `
        <tr>
          <td>#${escapeHtml(String(getSeq(item, index)))}</td>
          <td>${escapeHtml(item.type || '')}</td>
          <td>${renderMessageCell(item, index)}</td>
        </tr>
      `).join('')
      : '<tr><td colspan="3">No logs yet.</td></tr>';

    editor.modalHost.hidden = false;
    editor.modalHost.innerHTML = `
      <div class="mnb-modal-overlay">
        <div class="mnb-modal" style="width:min(900px,100%)">
          <div class="mnb-modal-head" style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
            <h3 style="margin:0;">Editor Logs</h3>
            <div style="display:flex;align-items:center;gap:8px;">
              <button type="button" class="mnb-btn secondary mnb-send-logs-btn">Send Logs</button>
              <button type="button" class="mnb-modal-close">×</button>
            </div>
          </div>
          <div class="mnb-modal-body">
            <div style="overflow:auto">
              <table style="width:100%;border-collapse:collapse">
                <thead>
                  <tr>
                    <th style="width:140px">Log Sequence</th>
                    <th style="width:220px">Type</th>
                    <th>Message</th>
                  </tr>
                </thead>
                <tbody>${rows}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    `;

    editor.modalHost.querySelectorAll('th,td').forEach((cell) => {
      cell.style.border = '1px solid #d9e2ef';
      cell.style.padding = '8px';
      cell.style.textAlign = 'left';
      cell.style.verticalAlign = 'top';
    });

    const close = () => {
      editor.modalHost.hidden = true;
      editor.modalHost.innerHTML = '';
    };

    editor.modalHost.querySelector('.mnb-modal-close').onclick = close;

    editor.modalHost.querySelector('.mnb-modal-overlay').onclick = (event) => {
      if (event.target.classList.contains('mnb-modal-overlay')) close();
    };

    editor.modalHost.querySelectorAll('.mnb-log-jump').forEach((button) => {
      button.onclick = () => {
        const seq = Number(button.dataset.seq);
        const entry = editor.logs.find((log, index) => getSeq(log, index) === seq);
        const target = entry?.target || entry?.data?.targetId || null;

        close();

        if (!target) {
          editor.alert?.('Linked editor place not found.', 'error');
          return;
        }

        editor.jumpToLogTarget(target);
      };
    });

    const sendButton = editor.modalHost.querySelector('.mnb-send-logs-btn');

    sendButton.onclick = async () => {
      const originalText = sendButton.textContent;
      sendButton.disabled = true;
      sendButton.textContent = 'Sending...';

      try {
        await editor.sendLogs();
      } finally {
        sendButton.disabled = false;
        sendButton.textContent = originalText;
      }
    };
  },
});