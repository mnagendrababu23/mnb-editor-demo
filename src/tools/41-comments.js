import { buttonTool } from '../core/toolkit.js';

const COMMENT_ATTR = 'data-comment';
const COMMENT_ID_ATTR = 'data-comment-id';
const COMMENT_TARGET_ATTR = 'data-comment-target';
const COMMENT_STYLE_ID = 'mnb-comment-ui-styles';

function createCommentId() {
  return `mnb-comment-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function ensureCommentStyles() {
  if (document.getElementById(COMMENT_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = COMMENT_STYLE_ID;
  style.textContent = `
    .mnb-comment-mark {
      background: rgba(250, 204, 21, 0.14);
      border-bottom: 1.5px dotted #f59e0b;
      cursor: pointer;
      transition: background .15s ease, border-color .15s ease;
      border-radius: 2px;
    }

    .mnb-comment-mark:hover {
      background: rgba(250, 204, 21, 0.24);
      border-bottom-color: #d97706;
    }

    .mnb-comment-popup {
      position: fixed;
      z-index: 999999;
      width: min(320px, calc(100vw - 24px));
      background: #ffffff;
      border: 1px solid #e5e7eb;
      border-radius: 14px;
      box-shadow: 0 16px 40px rgba(15, 23, 42, 0.16);
      overflow: hidden;
      font-family: Inter, "Segoe UI", Arial, sans-serif;
    }

    .mnb-comment-popup[hidden] {
      display: none !important;
    }

    .mnb-comment-popup-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 14px;
      border-bottom: 1px solid #eef2f7;
      background: #fafafa;
    }

    .mnb-comment-popup-title {
      font-size: 13px;
      font-weight: 700;
      color: #111827;
    }

    .mnb-comment-popup-close {
      border: 0;
      background: transparent;
      color: #6b7280;
      font-size: 18px;
      line-height: 1;
      cursor: pointer;
      border-radius: 8px;
      padding: 4px 6px;
    }

    .mnb-comment-popup-close:hover {
      background: #f3f4f6;
      color: #111827;
    }

    .mnb-comment-popup-body {
      padding: 14px;
      color: #111827;
      font-size: 14px;
      line-height: 1.5;
      white-space: pre-wrap;
      word-break: break-word;
      max-height: 220px;
      overflow: auto;
    }

    .mnb-comment-popup-actions {
      display: flex;
      gap: 8px;
      padding: 12px 14px 14px;
      border-top: 1px solid #eef2f7;
      background: #fff;
    }

    .mnb-comment-popup-btn {
      appearance: none;
      border: 1px solid #d1d5db;
      background: #fff;
      color: #111827;
      border-radius: 10px;
      padding: 8px 12px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }

    .mnb-comment-popup-btn:hover {
      background: #f9fafb;
    }

    .mnb-comment-popup-btn.primary {
      background: #2563eb;
      border-color: #2563eb;
      color: #fff;
    }

    .mnb-comment-popup-btn.primary:hover {
      background: #1d4ed8;
      border-color: #1d4ed8;
    }

    .mnb-comment-popup-btn.danger {
      color: #b91c1c;
      border-color: #fecaca;
      background: #fff7f7;
    }

    .mnb-comment-popup-btn.danger:hover {
      background: #fee2e2;
    }
  `;
  document.head.appendChild(style);
}

function getCommentText(target) {
  return String(target?.getAttribute(COMMENT_ATTR) || '').trim();
}

function setCommentText(target, comment) {
  target.setAttribute(COMMENT_ATTR, String(comment || '').trim());
}

function unwrapElement(element) {
  if (!element || !element.parentNode) return null;
  const parent = element.parentNode;

  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }

  parent.removeChild(element);
  parent.normalize?.();
  return parent;
}

function removeCommentTarget(target) {
  if (!target) return null;

  const type = target.getAttribute(COMMENT_TARGET_ATTR) || 'text';

  if (type === 'text') {
    return unwrapElement(target);
  }

  target.removeAttribute(COMMENT_ATTR);
  target.removeAttribute(COMMENT_ID_ATTR);
  target.removeAttribute(COMMENT_TARGET_ATTR);
  return target;
}

function installCommentUI(editor) {
  if (editor.__mnbCommentsInstalled) return editor.__mnbCommentUI;

  ensureCommentStyles();

  const popup = document.createElement('div');
  popup.className = 'mnb-comment-popup';
  popup.hidden = true;

  const head = document.createElement('div');
  head.className = 'mnb-comment-popup-head';

  const title = document.createElement('div');
  title.className = 'mnb-comment-popup-title';
  title.textContent = 'Comment';

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'mnb-comment-popup-close';
  closeBtn.setAttribute('aria-label', 'Close comment');
  closeBtn.textContent = '×';

  head.appendChild(title);
  head.appendChild(closeBtn);

  const body = document.createElement('div');
  body.className = 'mnb-comment-popup-body';

  const actions = document.createElement('div');
  actions.className = 'mnb-comment-popup-actions';

  const editBtn = document.createElement('button');
  editBtn.type = 'button';
  editBtn.className = 'mnb-comment-popup-btn primary';
  editBtn.textContent = 'Edit';

  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'mnb-comment-popup-btn danger';
  removeBtn.textContent = 'Remove';

  const doneBtn = document.createElement('button');
  doneBtn.type = 'button';
  doneBtn.className = 'mnb-comment-popup-btn';
  doneBtn.textContent = 'Close';

  actions.appendChild(editBtn);
  actions.appendChild(removeBtn);
  actions.appendChild(doneBtn);

  popup.appendChild(head);
  popup.appendChild(body);
  popup.appendChild(actions);
  document.body.appendChild(popup);

  const state = {
    popup,
    body,
    activeTarget: null,

    render(target) {
      if (!target) return;
      this.body.textContent = getCommentText(target) || 'No comment';
    },

    position() {
      if (!this.activeTarget || this.popup.hidden) return;

      const rect = this.activeTarget.getBoundingClientRect();

      requestAnimationFrame(() => {
        const popupWidth = this.popup.offsetWidth || 320;
        const popupHeight = this.popup.offsetHeight || 180;

        let left = rect.left;
        let top = rect.bottom + 10;

        if (left + popupWidth > window.innerWidth - 12) {
          left = window.innerWidth - popupWidth - 12;
        }
        if (left < 12) left = 12;

        if (top + popupHeight > window.innerHeight - 12) {
          top = rect.top - popupHeight - 10;
        }
        if (top < 12) top = 12;

        this.popup.style.left = `${left}px`;
        this.popup.style.top = `${top}px`;
      });
    },

    show(target) {
      this.activeTarget = target;
      this.render(target);
      this.popup.hidden = false;
      this.position();
    },

    hide() {
      this.activeTarget = null;
      this.popup.hidden = true;
    },
  };

  closeBtn.addEventListener('click', () => state.hide());
  doneBtn.addEventListener('click', () => state.hide());

  editBtn.addEventListener('click', async () => {
    const target = state.activeTarget;
    if (!target) return;

    const values = await editor.form(
      'Edit Comment',
      [
        {
          name: 'comment',
          label: 'Comment',
          type: 'textarea',
          value: getCommentText(target),
          rows: 4,
        },
      ],
      { submitText: 'Save' }
    );

    if (!values) return;

    const comment = String(values.comment || '').trim();
    if (!comment) {
      editor.alert('Please enter a comment.', 'error');
      return;
    }

    setCommentText(target, comment);
    editor.saveHistory?.('comment-edited');
    state.render(target);
    state.position();
    editor.alert('Comment updated.', 'success');
  });

  removeBtn.addEventListener('click', () => {
    const target = state.activeTarget;
    if (!target) return;

    state.hide();
    removeCommentTarget(target);
    editor.saveHistory?.('comment-removed');
    editor.alert('Comment removed.', 'success');
  });

  editor.surface.addEventListener('click', (event) => {
    const textTarget = event.target.closest?.('.mnb-comment-mark');
    if (textTarget && editor.surface.contains(textTarget)) {
      event.preventDefault();
      event.stopPropagation();
      state.show(textTarget);
      return;
    }

    state.hide();
  });

  document.addEventListener('mousedown', (event) => {
    if (state.popup.hidden) return;

    const insidePopup = state.popup.contains(event.target);
    const insideTarget = state.activeTarget?.contains?.(event.target);

    if (!insidePopup && !insideTarget) {
      state.hide();
    }
  });

  window.addEventListener('resize', () => state.position(), { passive: true });
  document.addEventListener('scroll', () => state.position(), true);

  editor.__mnbCommentsInstalled = true;
  editor.__mnbCommentUI = state;
  return state;
}

export default buttonTool({
  id: 'comments',
  label: 'Comments',
  icon: '💬',
  title: 'Comments',
  async run(editor) {
    installCommentUI(editor);

    const selectedText = (editor.getSelectedText?.() || '').trim();
    if (!selectedText) {
      editor.alert('Please select text to add a comment.', 'error');
      return;
    }

    const values = await editor.form(
      'Add Comment',
      [
        {
          name: 'comment',
          label: 'Comment',
          type: 'textarea',
          value: '',
          rows: 4,
          placeholder: `Add comment for: "${selectedText.slice(0, 60)}${selectedText.length > 60 ? '…' : ''}"`,
        },
      ],
      { submitText: 'Add Comment' }
    );

    if (!values) return;

    const comment = String(values.comment || '').trim();
    if (!comment) {
      editor.alert('Please enter a comment.', 'error');
      return;
    }

    const marker = editor.surroundSelection('span', {
      className: 'mnb-comment-mark',
      attrs: {
        [COMMENT_ID_ATTR]: createCommentId(),
        [COMMENT_ATTR]: comment,
        [COMMENT_TARGET_ATTR]: 'text',
      },
    });

    if (!marker) {
      editor.alert('Could not attach comment to selected text.', 'error');
      return;
    }

    editor.saveHistory?.('comment-added');
    editor.alert('Comment added.', 'success');
  },
});