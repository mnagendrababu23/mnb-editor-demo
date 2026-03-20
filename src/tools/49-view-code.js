import { buttonTool } from '../core/toolkit.js';

const VOID_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
  'link', 'meta', 'param', 'source', 'track', 'wbr',
]);

function repeatIndent(level, unit = '  ') {
  return unit.repeat(Math.max(0, level));
}

function protectBlocks(html) {
  const store = [];
  const protectedHTML = String(html || '').replace(
    /<(pre|script|style)(\b[^>]*)>[\s\S]*?<\/\1>/gi,
    (match) => {
      const key = `___MNB_RAW_BLOCK_${store.length}___`;
      store.push(match);
      return key;
    }
  );
  return { html: protectedHTML, store };
}

function restoreBlocks(html, store = []) {
  let output = String(html || '');
  store.forEach((value, index) => {
    output = output.replace(`___MNB_RAW_BLOCK_${index}___`, value);
  });
  return output;
}

function formatHTML(input, indentUnit = '  ') {
  if (!String(input || '').trim()) return '';

  const { html, store } = protectBlocks(input);
  const tokens = html
    .replace(/>\s+</g, '><')
    .match(/<!--[\s\S]*?-->|<\/?[^>]+>|[^<]+/g) || [];

  let depth = 0;
  const lines = [];

  for (let raw of tokens) {
    const token = raw.trim();
    if (!token) continue;

    if (token.startsWith('<!--')) {
      lines.push(`${repeatIndent(depth, indentUnit)}${token}`);
      continue;
    }

    if (token.startsWith('</')) {
      depth = Math.max(0, depth - 1);
      lines.push(`${repeatIndent(depth, indentUnit)}${token}`);
      continue;
    }

    if (token.startsWith('<')) {
      const match = token.match(/^<\s*([a-zA-Z0-9:-]+)/);
      const tag = match ? match[1].toLowerCase() : '';
      const selfClosing = /\/>$/.test(token) || VOID_TAGS.has(tag);

      lines.push(`${repeatIndent(depth, indentUnit)}${token}`);

      if (!selfClosing) {
        depth += 1;
      }
      continue;
    }

    const textLines = token
      .split(/\n+/)
      .map((item) => item.replace(/\s+/g, ' ').trim())
      .filter(Boolean);

    textLines.forEach((line) => {
      lines.push(`${repeatIndent(depth, indentUnit)}${line}`);
    });
  }

  return restoreBlocks(lines.join('\n'), store)
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function makeButton(label, variant = 'secondary') {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = label;
  Object.assign(btn.style, {
    appearance: 'none',
    border: variant === 'primary'
      ? '1px solid rgba(37,99,235,.28)'
      : '1px solid rgba(148,163,184,.24)',
    background: variant === 'primary'
      ? 'linear-gradient(180deg,#3b82f6 0%,#2563eb 100%)'
      : '#ffffff',
    color: variant === 'primary' ? '#ffffff' : '#0f172a',
    height: '40px',
    padding: '0 14px',
    borderRadius: '12px',
    fontSize: '13px',
    fontWeight: '800',
    cursor: 'pointer',
    boxShadow: variant === 'primary'
      ? '0 10px 24px rgba(37,99,235,.24)'
      : '0 4px 12px rgba(15,23,42,.04)',
  });
  return btn;
}

export default buttonTool({
  id: 'view-code',
  label: 'Code',
  icon: '</>',
  title: 'View Code',
  run(editor) {
    if (!editor?.modalHost) {
      editor?.alert?.('Code modal host not found.', 'error');
      return;
    }

    editor.captureSelection?.();

    if (typeof editor.__mnbCodeModalClose === 'function') {
      editor.__mnbCodeModalClose();
      return;
    }

    const modalHost = editor.modalHost;
    modalHost.hidden = false;
    modalHost.innerHTML = '';

    const overlay = document.createElement('div');
    overlay.className = 'mnb-modal-overlay';
    Object.assign(overlay.style, {
      position: 'fixed',
      inset: '0',
      zIndex: '9999',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '18px',
      background: 'rgba(15,23,42,.56)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    });

    const modal = document.createElement('div');
    modal.className = 'mnb-modal';
    Object.assign(modal.style, {
      width: 'min(1320px, 98vw)',
      height: 'min(94vh, 980px)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      borderRadius: '28px',
      border: '1px solid rgba(255,255,255,.14)',
      background: 'linear-gradient(180deg,#ffffff 0%,#f8fafc 100%)',
      boxShadow: '0 30px 90px rgba(15,23,42,.28)',
    });

    const head = document.createElement('div');
    Object.assign(head.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '16px',
      padding: '16px 18px',
      borderBottom: '1px solid rgba(148,163,184,.18)',
      background: 'rgba(255,255,255,.82)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
    });

    const titleWrap = document.createElement('div');
    titleWrap.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="
          width:38px;
          height:38px;
          border-radius:12px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          background:linear-gradient(135deg,#dbeafe,#eef2ff);
          font-size:16px;
          font-weight:900;
          color:#1e3a8a;
        ">&lt;/&gt;</span>
        <div>
          <div style="font-size:16px;font-weight:800;color:#0f172a;line-height:1.1;">HTML Code</div>
          <div style="font-size:12px;color:#64748b;margin-top:3px;">Formatted source editor in modal</div>
        </div>
      </div>
    `;

    const actions = document.createElement('div');
    Object.assign(actions.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexWrap: 'wrap',
      justifyContent: 'flex-end',
    });

    const formatBtn = makeButton('Format');
    const copyBtn = makeButton('Copy');
    const resetBtn = makeButton('Reset');
    const closeBtn = makeButton('Close');
    const saveBtn = makeButton('Apply', 'primary');

    actions.append(formatBtn, copyBtn, resetBtn, closeBtn, saveBtn);

    const body = document.createElement('div');
    Object.assign(body.style, {
      flex: '1',
      minHeight: '0',
      padding: '14px',
      background: 'linear-gradient(180deg, rgba(241,245,249,1) 0%, rgba(226,232,240,.9) 100%)',
    });

    const chrome = document.createElement('div');
    Object.assign(chrome.style, {
      height: '100%',
      borderRadius: '22px',
      overflow: 'hidden',
      border: '1px solid rgba(148,163,184,.18)',
      background: '#0f172a',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.04)',
      display: 'flex',
      flexDirection: 'column',
    });

    const chromeBar = document.createElement('div');
    Object.assign(chromeBar.style, {
      height: '46px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 14px',
      borderBottom: '1px solid rgba(148,163,184,.14)',
      background: 'linear-gradient(180deg,#111827 0%,#0f172a 100%)',
    });
    chromeBar.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="width:10px;height:10px;border-radius:999px;background:#f87171;display:inline-block;"></span>
        <span style="width:10px;height:10px;border-radius:999px;background:#fbbf24;display:inline-block;"></span>
        <span style="width:10px;height:10px;border-radius:999px;background:#34d399;display:inline-block;"></span>
      </div>
      <div style="
        max-width:460px;
        width:100%;
        height:28px;
        border-radius:999px;
        display:flex;
        align-items:center;
        justify-content:center;
        background:rgba(255,255,255,.06);
        border:1px solid rgba(148,163,184,.14);
        color:#94a3b8;
        font-size:12px;
        font-weight:700;
      ">HTML source</div>
      <div id="mnb-code-meta" style="font-size:12px;color:#94a3b8;font-weight:700;">0 chars</div>
    `;

    const editorWrap = document.createElement('div');
    Object.assign(editorWrap.style, {
      position: 'relative',
      flex: '1',
      minHeight: '0',
      background:
        'linear-gradient(180deg, rgba(15,23,42,1) 0%, rgba(2,6,23,1) 100%)',
    });

    const textarea = document.createElement('textarea');
    textarea.spellcheck = false;
    textarea.wrap = 'off';
    Object.assign(textarea.style, {
      width: '100%',
      height: '100%',
      border: '0',
      outline: 'none',
      resize: 'none',
      background: 'transparent',
      color: '#e2e8f0',
      padding: '22px 24px',
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
      fontSize: '13px',
      lineHeight: '1.65',
      tabSize: '2',
      whiteSpace: 'pre',
      overflow: 'auto',
    });

    const foot = document.createElement('div');
    Object.assign(foot.style, {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      padding: '12px 16px',
      borderTop: '1px solid rgba(148,163,184,.18)',
      background: 'rgba(255,255,255,.82)',
    });

    const footLeft = document.createElement('div');
    Object.assign(footLeft.style, {
      fontSize: '12px',
      color: '#64748b',
      fontWeight: '700',
    });
    footLeft.textContent = 'Format, edit, then apply to update the document';

    const footRight = document.createElement('div');
    Object.assign(footRight.style, {
      fontSize: '12px',
      color: '#64748b',
      fontWeight: '700',
    });
    footRight.textContent = 'ESC to close';

    const initialHTML = editor.getHTML?.() || '';
    textarea.value = formatHTML(initialHTML);

    const meta = chromeBar.querySelector('#mnb-code-meta');
    const updateMeta = () => {
      const text = textarea.value || '';
      const lines = text ? text.split('\n').length : 0;
      meta.textContent = `${text.length} chars • ${lines} lines`;
    };
    updateMeta();

    const close = () => {
      document.removeEventListener('keydown', onKeyDown);
      delete editor.__mnbCodeModalClose;
      modalHost.hidden = true;
      modalHost.innerHTML = '';
      editor.focus?.();
    };

    const applyChanges = () => {
      const nextHTML = textarea.value;
      editor.setHTML?.(nextHTML);
      editor.saveHistory?.('code-modal-apply');
      editor.alert?.('Code applied.', 'success');
      close();
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's') {
        event.preventDefault();
        applyChanges();
        return;
      }

      if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key.toLowerCase() === 'f') {
        event.preventDefault();
        textarea.value = formatHTML(textarea.value);
        updateMeta();
        editor.alert?.('Code formatted.', 'success');
      }
    };

    editor.__mnbCodeModalClose = close;

    textarea.addEventListener('input', updateMeta);

    textarea.addEventListener('keydown', (event) => {
      if (event.key === 'Tab') {
        event.preventDefault();
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        textarea.setRangeText('  ', start, end, 'end');
        updateMeta();
      }
    });

    formatBtn.addEventListener('click', () => {
      textarea.value = formatHTML(textarea.value);
      updateMeta();
      editor.alert?.('Code formatted.', 'success');
    });

    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(textarea.value);
        editor.alert?.('Code copied.', 'success');
      } catch {
        textarea.select();
        document.execCommand('copy');
        editor.alert?.('Code copied.', 'success');
      }
    });

    resetBtn.addEventListener('click', () => {
      textarea.value = formatHTML(editor.getHTML?.() || '');
      updateMeta();
      editor.alert?.('Code reset.', 'info');
    });

    closeBtn.addEventListener('click', close);
    saveBtn.addEventListener('click', applyChanges);

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close();
    });

    document.addEventListener('keydown', onKeyDown);

    head.appendChild(titleWrap);
    head.appendChild(actions);

    editorWrap.appendChild(textarea);
    chrome.appendChild(chromeBar);
    chrome.appendChild(editorWrap);
    body.appendChild(chrome);

    foot.appendChild(footLeft);
    foot.appendChild(footRight);

    modal.appendChild(head);
    modal.appendChild(body);
    modal.appendChild(foot);
    overlay.appendChild(modal);
    modalHost.appendChild(overlay);

    setTimeout(() => textarea.focus(), 20);
    editor.alert?.('Code view opened.', 'success');
  },
});