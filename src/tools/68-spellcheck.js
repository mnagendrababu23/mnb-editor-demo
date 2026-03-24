import { selectTool } from '../core/toolkit.js';

const SPELLCHECK_API_ENDPOINT = 'https://macharlanagendrababu.com/spellchecker/spellcheck.php';
const SPELLCHECK_STYLE_ID = 'mnb-spellcheck-api-style';

const SPELLCHECK_LANGUAGES = [
  { label: 'English', value: 'en' },
  { label: 'Hindi (India)', value: 'hi_IN' },
  { label: 'Telugu (India)', value: 'te_IN' },
  { label: 'Tamil (India)', value: 'ta_IN' },
  { label: 'French (France)', value: 'fr_FR' },
  { label: 'German', value: 'de' },
  { label: 'Spanish', value: 'es' },
  { label: 'Portuguese (Brazil)', value: 'pt_BR' },
  { label: 'Russian (Russia)', value: 'ru_RU' },
  { label: 'Ukrainian (Ukraine)', value: 'uk_UA' },
  { label: 'Vietnamese', value: 'vi' },
];

function getSpellcheckState(editor) {
  if (!editor.__mnbSpellcheckApiState) {
    editor.__mnbSpellcheckApiState = {
      language: 'en',
      lastResponse: null,
      activePopover: null,
      languagesLoaded: false,
      markCounter: 0,
    };
  }
  return editor.__mnbSpellcheckApiState;
}

function ensureSpellcheckStyles() {
  if (document.getElementById(SPELLCHECK_STYLE_ID)) return;

  const style = document.createElement('style');
  style.id = SPELLCHECK_STYLE_ID;
  style.textContent = `
    .mnb-spellcheck-mark {
      text-decoration-line: underline;
      text-decoration-style: wavy;
      text-decoration-color: #dc2626;
      text-underline-offset: 2px;
      background: rgba(220, 38, 38, 0.08);
      border-radius: 4px;
      cursor: pointer;
      padding: 0 1px;
      transition: background .15s ease;
    }

    .mnb-spellcheck-mark:hover {
      background: rgba(220, 38, 38, 0.16);
    }

    .mnb-spellcheck-popover,
    .mnb-spellcheck-popover * {
      pointer-events: auto;
      box-sizing: border-box;
    }

    .mnb-spellcheck-popover {
      position: fixed;
      z-index: 999999;
      width: 388px;
      max-width: calc(100vw - 24px);
      background: #ffffff;
      border: 1px solid #dbe2ea;
      border-radius: 18px;
      box-shadow: 0 20px 40px rgba(15, 23, 42, 0.18);
      overflow: hidden;
      user-select: none;
    }

    .mnb-spellcheck-popover-header {
      padding: 16px 18px 12px;
      border-bottom: 1px solid #eef2f7;
      background: linear-gradient(180deg, #f8fafc 0%, #ffffff 100%);
    }

    .mnb-spellcheck-popover-title {
      font-size: 12px;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: .08em;
      margin-bottom: 12px;
    }

    .mnb-spellcheck-popover-word {
      display: inline-flex;
      align-items: center;
      max-width: 100%;
      padding: 8px 14px;
      border-radius: 999px;
      background: #fee2e2;
      color: #991b1b;
      font-size: 18px;
      font-weight: 800;
      line-height: 1.2;
      word-break: break-word;
    }

    .mnb-spellcheck-popover-body {
      padding: 14px 18px 16px;
    }

    .mnb-spellcheck-popover-label {
      font-size: 14px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 10px;
    }

    .mnb-spellcheck-popover-list {
      display: grid;
      gap: 10px;
      max-height: 360px;
      overflow: auto;
      padding-right: 2px;
    }

    .mnb-spellcheck-popover-btn {
      width: 100%;
      border: 1px solid #dbe2ea;
      background: #f8fafc;
      color: #0f172a;
      border-radius: 14px;
      padding: 12px 14px;
      font: inherit;
      font-size: 16px;
      text-align: left;
      cursor: pointer;
      transition: all .15s ease;
    }

    .mnb-spellcheck-popover-btn:hover {
      background: #eff6ff;
      border-color: #93c5fd;
    }

    .mnb-spellcheck-popover-btn:active {
      transform: translateY(1px);
    }

    .mnb-spellcheck-popover-empty {
      font-size: 14px;
      color: #64748b;
      padding: 10px 2px;
    }

    .mnb-spellcheck-popover-actions {
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
      margin-top: 14px;
      padding-top: 14px;
      border-top: 1px solid #eef2f7;
    }

    .mnb-spellcheck-popover-action {
      border: 1px solid #dbe2ea;
      background: #fff;
      color: #334155;
      border-radius: 999px;
      padding: 8px 14px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: all .15s ease;
    }

    .mnb-spellcheck-popover-action:hover {
      background: #f8fafc;
    }
  `;

  document.head.appendChild(style);
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeSelectorValue(value = '') {
  const stringValue = String(value ?? '');
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(stringValue);
  }
  return stringValue.replace(/["\\]/g, '\\$&');
}

function normalizeWord(value = '') {
  return String(value || '')
    .trim()
    .replace(/^[^\p{L}\p{M}\p{N}]+|[^\p{L}\p{M}\p{N}]+$/gu, '')
    .replaceAll("'", '')
    .replaceAll('’', '')
    .toLowerCase();
}

function setSurfaceLanguage(editor, language) {
  const value = String(language || '').trim().replaceAll('_', '-');

  if (typeof editor.setSurfaceLanguage === 'function') {
    editor.setSurfaceLanguage(value);
    return;
  }

  if (!editor.surface) return;

  if (value) {
    editor.surface.setAttribute('lang', value);
  } else {
    editor.surface.removeAttribute('lang');
  }
}

function closeSuggestionPopover(editor) {
  const state = getSpellcheckState(editor);
  if (state.activePopover?.remove) {
    state.activePopover.remove();
  }
  state.activePopover = null;
}

function unwrapNode(node) {
  if (!node || !node.parentNode) return;
  while (node.firstChild) {
    node.parentNode.insertBefore(node.firstChild, node);
  }
  node.parentNode.removeChild(node);
}

function clearSpellcheckMarks(editor, options = {}) {
  const { resetResponse = false } = options;

  closeSuggestionPopover(editor);

  if (!editor?.surface) return;

  const marks = [...editor.surface.querySelectorAll('.mnb-spellcheck-mark')];
  marks.forEach((mark) => unwrapNode(mark));
  editor.surface.normalize();

  if (resetResponse) {
    const state = getSpellcheckState(editor);
    state.lastResponse = null;
  }
}

function buildMisspellingMap(items = []) {
  const map = new Map();

  items.forEach((item) => {
    if (!item || item.correct !== false || !item.word) return;

    const key = normalizeWord(item.word);
    if (!key) return;

    map.set(key, {
      word: String(item.word),
      suggestions: Array.isArray(item.suggestions) ? item.suggestions : [],
    });
  });

  return map;
}

function nextMarkId(editor) {
  const state = getSpellcheckState(editor);
  state.markCounter += 1;
  return `mnb-spell-${state.markCounter}`;
}

function highlightMisspellings(editor, items = []) {
  if (!editor?.surface) return 0;

  clearSpellcheckMarks(editor);

  const misspellingMap = buildMisspellingMap(items);
  if (!misspellingMap.size) return 0;

  const textNodes = [];
  const walker = document.createTreeWalker(
    editor.surface,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        if (!node || !node.nodeValue || !node.nodeValue.trim()) {
          return NodeFilter.FILTER_REJECT;
        }

        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        if (parent.closest('.mnb-spellcheck-mark')) return NodeFilter.FILTER_REJECT;
        if (parent.closest('script,style,textarea,code,pre')) return NodeFilter.FILTER_REJECT;

        return NodeFilter.FILTER_ACCEPT;
      },
    }
  );

  let current;
  while ((current = walker.nextNode())) {
    textNodes.push(current);
  }

  const wordPattern = /[\p{L}\p{M}][\p{L}\p{M}\p{N}'’_-]*/gu;
  let markCount = 0;

  textNodes.forEach((textNode) => {
    const text = textNode.nodeValue || '';
    let lastIndex = 0;
    let matchedAny = false;
    const fragment = document.createDocumentFragment();

    for (const match of text.matchAll(wordPattern)) {
      const word = match[0];
      const start = match.index ?? 0;
      const end = start + word.length;
      const key = normalizeWord(word);
      const meta = misspellingMap.get(key);

      if (!meta) continue;

      matchedAny = true;

      if (start > lastIndex) {
        fragment.appendChild(document.createTextNode(text.slice(lastIndex, start)));
      }

      const mark = document.createElement('span');
      mark.className = 'mnb-spellcheck-mark';
      mark.dataset.word = word;
      mark.dataset.key = key;
      mark.dataset.markId = nextMarkId(editor);
      mark.dataset.suggestions = JSON.stringify(meta.suggestions || []);
      mark.textContent = word;
      mark.setAttribute('spellcheck', 'false');

      fragment.appendChild(mark);
      lastIndex = end;
      markCount += 1;
    }

    if (!matchedAny) return;

    if (lastIndex < text.length) {
      fragment.appendChild(document.createTextNode(text.slice(lastIndex)));
    }

    textNode.parentNode?.replaceChild(fragment, textNode);
  });

  return markCount;
}

function dispatchEditorInput(editor) {
  if (!editor?.surface) return;
  editor.surface.dispatchEvent(new Event('input', { bubbles: true }));
}

function getLiveSpellcheckMark(editor, markOrId) {
  if (!editor?.surface || !markOrId) return null;

  if (markOrId instanceof Element) {
    return editor.surface.contains(markOrId) ? markOrId : null;
  }

  const markId = String(markOrId || '').trim();
  if (!markId) return null;

  return editor.surface.querySelector(
    `.mnb-spellcheck-mark[data-mark-id="${escapeSelectorValue(markId)}"]`
  );
}

function moveCaretAfterNode(editor, node) {
  if (!editor?.surface || !node || !node.parentNode) return;

  const selection = window.getSelection?.();
  if (!selection) return;

  const range = document.createRange();
  range.setStartAfter(node);
  range.collapse(true);

  selection.removeAllRanges();
  selection.addRange(range);

  editor.currentRange = range.cloneRange();
  editor.captureSelection?.(range);
}

function removeResolvedWordFromState(editor, key) {
  const state = getSpellcheckState(editor);
  if (!key || !Array.isArray(state?.lastResponse?.items)) return;

  const stillMarked = editor?.surface?.querySelector?.(
    `.mnb-spellcheck-mark[data-key="${escapeSelectorValue(key)}"]`
  );

  if (stillMarked) return;

  state.lastResponse.items = state.lastResponse.items.filter((item) => {
    return normalizeWord(item?.word || '') !== key;
  });
}

function applyReplacement(editor, mark, replacementText) {
  editor.surface?.focus();

  const selection = window.getSelection?.();
  const range = document.createRange();
  range.selectNode(mark);

  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }

  editor.currentRange = range.cloneRange();
  editor.captureSelection?.(range);

  const replacementNode = document.createTextNode(replacementText);
  range.deleteContents();
  range.insertNode(replacementNode);

  moveCaretAfterNode(editor, replacementNode);
  dispatchEditorInput(editor);
  editor.refreshStatus?.();
  editor.updatePreview?.();
  editor.saveHistory?.('spellcheck-replace');
}

function replaceMarkedWord(editor, markOrId, suggestion, sourceEvent = 'unknown') {
  const mark = getLiveSpellcheckMark(editor, markOrId);

  if (!mark || !mark.parentNode) {
    console.log('[MNB Spellcheck] replace failed: mark not found', {
      markOrId,
      suggestion,
      sourceEvent,
    });
    return false;
  }

  const replacementText = String(suggestion || '').trim();
  if (!replacementText) {
    console.log('[MNB Spellcheck] replace failed: empty suggestion', {
      suggestion,
      sourceEvent,
    });
    return false;
  }

  const wrongWord = mark.dataset.word || mark.textContent || '';
  const key = mark.dataset.key || normalizeWord(wrongWord);

  console.log('[MNB Spellcheck] suggestion selected', {
    sourceEvent,
    wrongWord,
    replacementText,
    markId: mark.dataset.markId,
  });

  closeSuggestionPopover(editor);
  applyReplacement(editor, mark, replacementText);
  removeResolvedWordFromState(editor, key);

  const remaining = editor.surface?.querySelectorAll('.mnb-spellcheck-mark').length || 0;
  const updatedText =
    editor.getText?.() ||
    editor.surface?.innerText ||
    editor.surface?.textContent ||
    '';

  console.log('[MNB Spellcheck] content updated', {
    wrongWord,
    replacementText,
    remainingIssues: remaining,
    updatedText,
  });

  editor.alert?.(
    remaining
      ? `Replaced successfully. ${remaining} issue${remaining === 1 ? '' : 's'} remaining.`
      : 'Replaced successfully. No highlighted issues remaining.',
    'success'
  );

  return true;
}

function ignoreMarkedWord(editor, markOrId) {
  const mark = getLiveSpellcheckMark(editor, markOrId);
  if (!mark || !mark.parentNode) return false;

  const word = mark.dataset.word || mark.textContent || '';
  const key = mark.dataset.key || normalizeWord(word);
  const parent = mark.parentNode;
  const focusNode = mark.previousSibling || mark.nextSibling || parent;

  console.log('[MNB Spellcheck] ignore clicked', {
    word,
    markId: mark.dataset.markId,
  });

  closeSuggestionPopover(editor);
  unwrapNode(mark);
  editor.surface?.normalize();

  if (focusNode?.nodeType === Node.TEXT_NODE) {
    const selection = window.getSelection?.();
    if (selection) {
      const range = document.createRange();
      range.setStart(focusNode, focusNode.textContent?.length || 0);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      editor.currentRange = range.cloneRange();
      editor.captureSelection?.(range);
    }
  } else {
    editor.captureSelection?.();
  }

  removeResolvedWordFromState(editor, key);

  dispatchEditorInput(editor);
  editor.refreshStatus?.();
  editor.updatePreview?.();
  editor.saveHistory?.('spellcheck-ignore');
  editor.surface?.focus();

  return true;
}

function bindPopoverButton(button, handler) {
  let handled = false;

  const run = (eventName, event) => {
    event.preventDefault();
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') {
      event.stopImmediatePropagation();
    }

    if (handled) return;
    handled = true;

    handler(eventName);

    requestAnimationFrame(() => {
      handled = false;
    });
  };

  button.style.pointerEvents = 'auto';

  button.addEventListener('pointerdown', (event) => {
    run('pointerdown', event);
  }, true);

  button.addEventListener('mousedown', (event) => {
    run('mousedown', event);
  }, true);

  button.addEventListener('click', (event) => {
    run('click', event);
  }, true);
}

function showSuggestionPopover(editor, markOrId) {
  const mark = getLiveSpellcheckMark(editor, markOrId);
  if (!mark) return;

  closeSuggestionPopover(editor);

  const state = getSpellcheckState(editor);
  const markId = mark.dataset.markId;

  const suggestions = (() => {
    try {
      const parsed = JSON.parse(mark.dataset.suggestions || '[]');
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  })();

  const popover = document.createElement('div');
  popover.className = 'mnb-spellcheck-popover';
  popover.setAttribute('contenteditable', 'false');
  popover.style.pointerEvents = 'auto';

  popover.addEventListener('pointerdown', (event) => {
    event.stopPropagation();
    if (typeof event.stopImmediatePropagation === 'function') {
      event.stopImmediatePropagation();
    }
  }, true);

  popover.innerHTML = `
    <div class="mnb-spellcheck-popover-header">
      <div class="mnb-spellcheck-popover-title">Suggestions for</div>
      <div class="mnb-spellcheck-popover-word">${escapeHtml(mark.dataset.word || mark.textContent || '')}</div>
    </div>
    <div class="mnb-spellcheck-popover-body">
      <div class="mnb-spellcheck-popover-label">Choose a replacement</div>
      <div class="mnb-spellcheck-popover-list"></div>
      <div class="mnb-spellcheck-popover-actions"></div>
    </div>
  `;

  const list = popover.querySelector('.mnb-spellcheck-popover-list');
  const actions = popover.querySelector('.mnb-spellcheck-popover-actions');

  if (suggestions.length) {
    suggestions.slice(0, 8).forEach((suggestion) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'mnb-spellcheck-popover-btn';
      button.textContent = suggestion;
      button.setAttribute('contenteditable', 'false');

      bindPopoverButton(button, (sourceEvent) => {
        replaceMarkedWord(editor, markId, suggestion, sourceEvent);
      });

      list.appendChild(button);
    });
  } else {
    const empty = document.createElement('div');
    empty.className = 'mnb-spellcheck-popover-empty';
    empty.textContent = 'No suggestions available';
    list.appendChild(empty);
  }

  const ignoreButton = document.createElement('button');
  ignoreButton.type = 'button';
  ignoreButton.className = 'mnb-spellcheck-popover-action';
  ignoreButton.textContent = 'Ignore';
  ignoreButton.setAttribute('contenteditable', 'false');

  bindPopoverButton(ignoreButton, () => {
    ignoreMarkedWord(editor, markId);
  });

  const clearButton = document.createElement('button');
  clearButton.type = 'button';
  clearButton.className = 'mnb-spellcheck-popover-action';
  clearButton.textContent = 'Clear all';
  clearButton.setAttribute('contenteditable', 'false');

  bindPopoverButton(clearButton, () => {
    console.log('[MNB Spellcheck] clear all clicked');
    clearSpellcheckMarks(editor, { resetResponse: true });
    dispatchEditorInput(editor);
    editor.refreshStatus?.();
    editor.updatePreview?.();
    editor.saveHistory?.('spellcheck-clear');
    editor.alert?.('Spellcheck highlights cleared.', 'info');
  });

  actions.appendChild(ignoreButton);
  actions.appendChild(clearButton);

  document.body.appendChild(popover);
  state.activePopover = popover;

  const markRect = mark.getBoundingClientRect();

  requestAnimationFrame(() => {
    const popRect = popover.getBoundingClientRect();
    let left = markRect.left;
    let top = markRect.bottom + 10;

    if (left + popRect.width > window.innerWidth - 16) {
      left = window.innerWidth - popRect.width - 16;
    }

    if (top + popRect.height > window.innerHeight - 16) {
      top = markRect.top - popRect.height - 10;
    }

    popover.style.left = `${Math.max(12, left)}px`;
    popover.style.top = `${Math.max(12, top)}px`;
  });
}

function bindSpellcheckEvents(editor) {
  if (editor.__mnbSpellcheckApiBound) return;
  editor.__mnbSpellcheckApiBound = true;

  editor.surface?.addEventListener('pointerdown', (event) => {
    const mark = event.target?.closest?.('.mnb-spellcheck-mark');
    if (!mark || !editor.surface.contains(mark)) return;

    event.preventDefault();
    event.stopPropagation();

    console.log('[MNB Spellcheck] mark clicked', {
      word: mark.dataset.word || mark.textContent || '',
      markId: mark.dataset.markId,
    });

    showSuggestionPopover(editor, mark);
  });

  document.addEventListener('pointerdown', (event) => {
    const state = getSpellcheckState(editor);
    const popover = state.activePopover;
    const clickedMark = event.target?.closest?.('.mnb-spellcheck-mark');

    if (!popover) return;
    if (popover.contains(event.target)) return;
    if (clickedMark) return;

    closeSuggestionPopover(editor);
  }, true);

  window.addEventListener('resize', () => {
    closeSuggestionPopover(editor);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeSuggestionPopover(editor);
    }
  });
}

async function loadLanguagesFromApi(tool) {
  if (tool.__mnbLanguagesLoaded) return;

  try {
    const response = await fetch(SPELLCHECK_API_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'languages' }),
    });

    const data = await response.json();

    let codes = [];
    if (Array.isArray(data?.languages)) {
      codes = data.languages.filter(Boolean);
    } else if (Array.isArray(data?.files)) {
      codes = data.files.map((item) => item?.lang).filter(Boolean);
    }

    if (codes.length) {
      const seen = new Set();
      tool.options = codes
        .filter((code) => {
          if (!code || seen.has(code)) return false;
          seen.add(code);
          return true;
        })
        .sort((a, b) => a.localeCompare(b))
        .map((code) => ({ label: code, value: code }));
    }
  } catch {
    // keep fallback list
  }

  tool.__mnbLanguagesLoaded = true;
}

async function runApiSpellcheck(editor) {
  const state = getSpellcheckState(editor);

  const text =
    editor.getText?.() ||
    editor.surface?.innerText ||
    editor.surface?.textContent ||
    '';

  if (!text.trim()) {
    clearSpellcheckMarks(editor, { resetResponse: true });
    editor.alert?.('Nothing to check.', 'info');
    return { marks: 0, misspelled: 0 };
  }

  const response = await fetch(SPELLCHECK_API_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lang: state.language || 'en',
      text,
    }),
  });

  let data = null;
  try {
    data = await response.json();
  } catch {
    throw new Error('Spellcheck API returned invalid JSON.');
  }

  if (!response.ok || data?.ok === false) {
    throw new Error(data?.error || 'Spellcheck API request failed.');
  }

  const items = Array.isArray(data?.items) ? data.items : [];
  const misspelled = items.filter((item) => item?.correct === false).length;
  const marks = highlightMisspellings(editor, items);

  state.lastResponse = {
    ...data,
    items,
  };

  return { marks, misspelled };
}

function syncSpellcheckToolUi(editor, element = null) {
  const state = getSpellcheckState(editor);
  const wrap = element || editor.root?.querySelector('[data-tool="spellcheck"]');
  const button = wrap?.querySelector('.mnb-tool-button');
  const valueNode = wrap?.querySelector('.mnb-tool-value');

  if (button) {
    button.classList.toggle('is-active', true);
    button.setAttribute('aria-pressed', 'true');
    button.dataset.tooltipBody = `Spellcheck language: ${state.language || 'en'}. Selecting a language runs spellcheck immediately.`;
  }

  if (valueNode) {
    valueNode.textContent = state.language || 'en';
  }
}

const spellcheckTool = selectTool({
  id: 'spellcheck',
  label: 'Spellcheck',
  icon: '✓',
  title: 'Spellcheck',
  toolbarLabel: 'Spellcheck',
  toolbarVariant: 'compact',
  value: 'en',
  options: [...SPELLCHECK_LANGUAGES],
  usage: 'Choose spellcheck language from the dropdown. Selecting a language runs the PHP spellcheck API immediately.',

  async onRendered(editor, element) {
    const state = getSpellcheckState(editor);
    ensureSpellcheckStyles();
    bindSpellcheckEvents(editor);

    state.language = spellcheckTool.value || 'en';
    setSurfaceLanguage(editor, state.language);
    syncSpellcheckToolUi(editor, element);

    await loadLanguagesFromApi(spellcheckTool);
  },

  async run(editor, value) {
    const state = getSpellcheckState(editor);
    ensureSpellcheckStyles();
    bindSpellcheckEvents(editor);

    const language = String(value || 'en').trim() || 'en';
    state.language = language;
    spellcheckTool.value = language;

    setSurfaceLanguage(editor, language);
    clearSpellcheckMarks(editor, { resetResponse: true });

    try {
      const result = await runApiSpellcheck(editor);
      syncSpellcheckToolUi(editor);
      editor.surface?.focus();

      editor.alert?.(
        result.misspelled > 0
          ? `Spellcheck completed in ${language}. Found ${result.misspelled} misspelled word${result.misspelled === 1 ? '' : 's'}.`
          : `Spellcheck completed in ${language}. No spelling issues found.`,
        'success'
      );
    } catch (error) {
      syncSpellcheckToolUi(editor);
      editor.alert?.(error?.message || 'Spellcheck failed.', 'error');
    }

    return language;
  },
});

export default spellcheckTool;