import { buttonTool } from '../core/toolkit.js';

function buildPreviewDocument(editor) {
  const html = typeof editor.getHTML === 'function' ? editor.getHTML() : '';
  const externalFontLinks =
    typeof editor.getExternalFontLinksHTML === 'function'
      ? editor.getExternalFontLinksHTML()
      : '';
  const fontFaceCSS =
    typeof editor.getFontFaceCSS === 'function'
      ? editor.getFontFaceCSS()
      : '';

  return `
    <!doctype html>
    <html>
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        ${externalFontLinks}
        <style>
          ${fontFaceCSS}

          :root {
            color-scheme: light;
            --bg: #eef3f9;
            --page-bg: #ffffff;
            --page-border: rgba(15, 23, 42, 0.08);
            --text: #0f172a;
            --muted: #64748b;
            --shadow: 0 24px 60px rgba(15, 23, 42, 0.14);
          }

          * {
            box-sizing: border-box;
          }

          html, body {
            margin: 0;
            padding: 0;
            min-height: 100%;
            background:
              radial-gradient(circle at top, rgba(59, 130, 246, 0.08), transparent 30%),
              linear-gradient(180deg, #f8fbff 0%, var(--bg) 100%);
          }

          body {
            font-family: Inter, "Segoe UI", Arial, sans-serif;
            color: var(--text);
            line-height: 1.7;
            padding: 48px 24px 72px;
          }

          .mnb-preview-wrap {
            max-width: 1120px;
            margin: 0 auto;
          }

          .mnb-preview-topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 16px;
            margin: 0 auto 24px;
            max-width: 920px;
            color: var(--muted);
            font-size: 13px;
            letter-spacing: .02em;
          }

          .mnb-preview-topbar strong {
            color: var(--text);
            font-size: 14px;
          }

          .mnb-preview-page {
            width: min(920px, 100%);
            margin: 0 auto;
            background: var(--page-bg);
            border: 1px solid var(--page-border);
            border-radius: 24px;
            box-shadow: var(--shadow);
            min-height: calc(100vh - 180px);
            padding: 56px 64px;
            overflow-wrap: break-word;
          }

          .mnb-preview-page > :first-child {
            margin-top: 0 !important;
          }

          .mnb-preview-page > :last-child {
            margin-bottom: 0 !important;
          }

          h1, h2, h3, h4, h5, h6 {
            color: #0f172a;
            line-height: 1.2;
            margin: 0 0 14px;
          }

          h1 { font-size: 2.2rem; }
          h2 { font-size: 1.8rem; }
          h3 { font-size: 1.45rem; }

          p, li, td, th, blockquote, pre {
            font-size: 15px;
          }

          p {
            margin: 0 0 14px;
          }

          ul, ol {
            margin: 0 0 16px 24px;
            padding: 0;
          }

          li + li {
            margin-top: 6px;
          }

          a {
            color: #2563eb;
            text-decoration-thickness: 1.5px;
            text-underline-offset: 2px;
          }

          blockquote {
            margin: 20px 0;
            padding: 16px 18px;
            border-left: 4px solid #6366f1;
            background: #f5f7ff;
            border-radius: 14px;
            color: #334155;
          }

          pre, code {
            font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace;
          }

          pre {
            margin: 18px 0;
            padding: 16px 18px;
            background: #0f172a;
            color: #e2e8f0;
            border-radius: 16px;
            overflow: auto;
            line-height: 1.6;
          }

          code {
            background: #f1f5f9;
            padding: .15em .4em;
            border-radius: 8px;
          }

          hr {
            border: 0;
            border-top: 1px solid #e2e8f0;
            margin: 28px 0;
          }

          img, video, iframe, svg, canvas {
            max-width: 100%;
            height: auto;
            border-radius: 16px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin: 18px 0;
            overflow: hidden;
            border-radius: 16px;
          }

          th, td {
            border: 1px solid #dbe3ee;
            padding: 10px 12px;
            text-align: left;
            vertical-align: top;
          }

          th {
            background: #f8fafc;
            font-weight: 700;
          }

          .mnb-hidden-block {
            display: none !important;
          }

          .mnb-columns {
            display: grid;
            gap: 18px;
            margin: 18px 0;
          }

          .mnb-columns.two {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .mnb-columns.three {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }

          .mnb-card {
            border: 1px solid #dbe3f0;
            border-radius: 18px;
            padding: 18px;
            background: #fff;
            box-shadow: 0 8px 22px rgba(15, 23, 42, 0.04);
          }

          .mnb-callout {
            border-left: 4px solid #4f46e5;
            background: #eef2ff;
            padding: 18px;
            border-radius: 16px;
          }

          .mnb-badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            padding: 6px 10px;
            border-radius: 999px;
            background: #eff6ff;
            border: 1px solid #bfdbfe;
            font-size: 12px;
            font-weight: 700;
          }

          [data-text-animation="pulse"] {
            animation: pulse 1.4s ease-in-out infinite;
          }

          [data-text-animation="float"] {
            animation: floaty 1.8s ease-in-out infinite;
          }

          [data-text-animation="glow"] {
            animation: glow 1.8s ease-in-out infinite;
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.03); }
          }

          @keyframes floaty {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-3px); }
          }

          @keyframes glow {
            0%, 100% { text-shadow: none; }
            50% { text-shadow: 0 0 18px rgba(79, 70, 229, .35); }
          }

          @media (max-width: 860px) {
            body {
              padding: 22px 12px 40px;
            }

            .mnb-preview-page {
              border-radius: 18px;
              padding: 28px 18px;
            }

            .mnb-columns.two,
            .mnb-columns.three {
              grid-template-columns: 1fr;
            }
          }
        </style>
      </head>
      <body>
        <div class="mnb-preview-wrap">
          <div class="mnb-preview-topbar">
            <div><strong>Document Preview</strong></div>
            <div>Read only</div>
          </div>
          <div class="mnb-preview-page">${html}</div>
        </div>
      </body>
    </html>
  `;
}

function renderIntoFrame(frame, editor) {
  const doc = frame.contentDocument;
  if (!doc) return;

  doc.open();
  doc.write(buildPreviewDocument(editor));
  doc.close();
}

export default buttonTool({
  id: 'preview',
  label: 'Preview',
  icon: '👁',
  title: 'Preview',
  run(editor) {
    if (!editor?.modalHost) {
      editor?.alert?.('Preview modal host not found.', 'error');
      return;
    }

    editor.captureSelection?.();

    if (typeof editor.__mnbPreviewModalClose === 'function') {
      editor.__mnbPreviewModalClose();
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
      background: 'rgba(15,23,42,.52)',
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
      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      boxShadow: '0 30px 90px rgba(15,23,42,.28)',
    });

    const head = document.createElement('div');
    head.className = 'mnb-modal-head';
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
    titleWrap.style.minWidth = '0';
    titleWrap.innerHTML = `
      <div style="display:flex;align-items:center;gap:10px;">
        <span style="
          width:36px;
          height:36px;
          border-radius:12px;
          display:inline-flex;
          align-items:center;
          justify-content:center;
          background:linear-gradient(135deg,#dbeafe,#eef2ff);
          font-size:18px;
        ">👁</span>
        <div style="min-width:0;">
          <div style="font-size:16px;font-weight:800;color:#0f172a;line-height:1.1;">Preview</div>
          <div style="font-size:12px;color:#64748b;margin-top:3px;">Clean document view in modal</div>
        </div>
      </div>
    `;

    const actions = document.createElement('div');
    Object.assign(actions.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      flexShrink: '0',
    });

    const makeBtn = (label) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = label;
      Object.assign(btn.style, {
        appearance: 'none',
        border: '1px solid rgba(148,163,184,.25)',
        background: '#fff',
        color: '#0f172a',
        height: '38px',
        padding: '0 14px',
        borderRadius: '12px',
        fontSize: '13px',
        fontWeight: '700',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(15,23,42,.04)',
      });
      return btn;
    };

    const refreshBtn = makeBtn('Refresh');
    const closeBtn = makeBtn('Close');

    const body = document.createElement('div');
    body.className = 'mnb-modal-body';
    Object.assign(body.style, {
      flex: '1',
      minHeight: '0',
      padding: '14px',
      background:
        'linear-gradient(180deg, rgba(241,245,249,1) 0%, rgba(226,232,240,.9) 100%)',
    });

    const chrome = document.createElement('div');
    Object.assign(chrome.style, {
      height: '100%',
      borderRadius: '22px',
      overflow: 'hidden',
      border: '1px solid rgba(148,163,184,.18)',
      background: '#e2e8f0',
      boxShadow: 'inset 0 1px 0 rgba(255,255,255,.65)',
      display: 'flex',
      flexDirection: 'column',
    });

    const chromeBar = document.createElement('div');
    Object.assign(chromeBar.style, {
      height: '44px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 14px',
      borderBottom: '1px solid rgba(148,163,184,.16)',
      background: 'linear-gradient(180deg,#f8fafc 0%,#eef2f7 100%)',
    });
    chromeBar.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="width:10px;height:10px;border-radius:999px;background:#f87171;display:inline-block;"></span>
        <span style="width:10px;height:10px;border-radius:999px;background:#fbbf24;display:inline-block;"></span>
        <span style="width:10px;height:10px;border-radius:999px;background:#34d399;display:inline-block;"></span>
      </div>
      <div style="
        max-width:420px;
        width:100%;
        height:28px;
        border-radius:999px;
        display:flex;
        align-items:center;
        justify-content:center;
        background:#ffffff;
        border:1px solid rgba(148,163,184,.18);
        color:#64748b;
        font-size:12px;
        font-weight:600;
        box-shadow: inset 0 1px 0 rgba(255,255,255,.65);
      ">Document preview</div>
      <div style="width:54px;"></div>
    `;

    const frame = document.createElement('iframe');
    frame.title = 'Preview';
    Object.assign(frame.style, {
      width: '100%',
      height: '100%',
      border: '0',
      background: '#fff',
      flex: '1',
    });

    const foot = document.createElement('div');
    foot.className = 'mnb-modal-foot';
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
    footLeft.textContent = 'ESC to close';
    Object.assign(footLeft.style, {
      fontSize: '12px',
      color: '#64748b',
      fontWeight: '600',
    });

    const footRight = document.createElement('div');
    Object.assign(footRight.style, {
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
    });

    const close = () => {
      document.removeEventListener('keydown', onKeyDown);
      delete editor.__mnbPreviewModalClose;
      modalHost.hidden = true;
      modalHost.innerHTML = '';
      editor.focus?.();
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        close();
      }
    };

    editor.__mnbPreviewModalClose = close;

    refreshBtn.addEventListener('click', () => {
      renderIntoFrame(frame, editor);
      editor.alert?.('Preview refreshed.', 'success');
    });

    closeBtn.addEventListener('click', close);

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close();
    });

    document.addEventListener('keydown', onKeyDown);

    actions.appendChild(refreshBtn);
    actions.appendChild(closeBtn);

    head.appendChild(titleWrap);
    head.appendChild(actions);

    chrome.appendChild(chromeBar);
    chrome.appendChild(frame);
    body.appendChild(chrome);

    footRight.appendChild(makeBtn('Close'));
    footRight.lastChild.addEventListener('click', close);

    foot.appendChild(footLeft);
    foot.appendChild(footRight);

    modal.appendChild(head);
    modal.appendChild(body);
    modal.appendChild(foot);
    overlay.appendChild(modal);
    modalHost.appendChild(overlay);

    renderIntoFrame(frame, editor);
    editor.alert?.('Preview opened.', 'success');
  },
});