import { buttonTool } from '../core/toolkit.js';

const DEFAULT_PROVIDERS = [
  { label: 'Anthropic', value: 'anthropic' },
  { label: 'OpenAI', value: 'openai' },
  { label: 'Google', value: 'google' },
  { label: 'OpenRouter', value: 'openrouter' },
  { label: 'Fireworks', value: 'fireworks' },
  { label: 'Baseten', value: 'baseten' },
  { label: 'Ollama', value: 'ollama' },
];

const ACTION_OPTIONS = [
  { label: 'Improve writing', value: 'improve' },
  { label: 'Rewrite', value: 'rewrite' },
  { label: 'Summarize', value: 'summarize' },
  { label: 'Continue writing', value: 'continue' },
  { label: 'Translate', value: 'translate' },
  { label: 'Custom prompt', value: 'custom' },
];

const APPLY_OPTIONS = [
  { label: 'Replace selection', value: 'replace-selection' },
  { label: 'Insert below current block', value: 'insert-below' },
  { label: 'Append at document end', value: 'append-end' },
];

const DIRECT_PROVIDER_HINTS = {
  openai: 'Direct request to OpenAI',
  anthropic: 'Direct request to Anthropic',
  google: 'Direct request to Gemini API',
  openrouter: 'Direct request to OpenRouter',
  fireworks: 'Direct request to Fireworks',
  baseten: 'Direct request to Baseten',
  ollama: 'Direct request to Ollama',
};

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function textToHtml(text = '') {
  const normalized = String(text || '').replace(/\r\n/g, '\n').trim();
  if (!normalized) return '<p><br></p>';

  return normalized
    .split(/\n{2,}/)
    .map((chunk) => `<p>${escapeHtml(chunk).replace(/\n/g, '<br>')}</p>`)
    .join('');
}

function normalizeProviders(list) {
  if (!Array.isArray(list)) return [];

  return list
    .map((item) => {
      if (!item) return null;

      if (typeof item === 'string') {
        const value = item.trim();
        if (!value) return null;

        const found = DEFAULT_PROVIDERS.find((provider) => provider.value === value);
        return found || {
          label: value.charAt(0).toUpperCase() + value.slice(1),
          value,
        };
      }

      if (typeof item === 'object') {
        const value = String(item.value || '').trim();
        const label = String(item.label || value).trim();

        if (!value) return null;
        return { label, value };
      }

      return null;
    })
    .filter(Boolean);
}

function getAIConfig(editor) {
  const config = editor?.options?.ai || {};
  const configuredProviders = normalizeProviders(config.providers);
  const providers = configuredProviders.length ? configuredProviders : DEFAULT_PROVIDERS;

  let defaultProvider = config.defaultProvider || 'openai';
  if (!providers.some((item) => item.value === defaultProvider)) {
    defaultProvider = providers[0]?.value || 'openai';
  }

  const endpoint =
    typeof config.endpoint === 'string' && config.endpoint.trim()
      ? config.endpoint.trim()
      : '';

  return {
    endpoint,
    useBackend: Boolean(endpoint),
    providers,
    defaultProvider,
    defaultAction: config.defaultAction || 'improve',
    defaultApplyMode: config.defaultApplyMode || 'replace-selection',
    includeDocumentDefault: Boolean(config.includeDocumentDefault),
    defaultTemperature:
      config.defaultTemperature == null || config.defaultTemperature === ''
        ? '0.4'
        : String(config.defaultTemperature),
    openrouterHttpReferer: config.openrouterHttpReferer || '',
    openrouterXTitle: config.openrouterXTitle || '',
    lastApiKeys: { ...(config.lastApiKeys || {}) },
  };
}

function getProviderLabel(providers, value) {
  const found = (providers || []).find((item) => item.value === value);
  return found?.label || value;
}

function afterContentChange(editor, reason = 'ai-integration') {
  editor.captureSelection?.();
  editor.saveHistory?.(reason);
  editor.refreshStatus?.();
  editor.surface?.dispatchEvent(new Event('input', { bubbles: true }));
}

function replaceSelection(editor, text) {
  const normalized = String(text || '');
  if (!normalized.trim()) return;

  if (/\n/.test(normalized)) {
    editor.insertHTML(textToHtml(normalized));
  } else {
    editor.insertText(normalized);
  }
}

function insertBelowCurrentBlock(editor, text) {
  const block = editor.getSelectedBlock?.();
  const html = textToHtml(text);

  if (block && block !== editor.surface) {
    block.insertAdjacentHTML('afterend', html);
    afterContentChange(editor, 'ai-insert-below');
    return;
  }

  editor.insertHTML(html);
}

function appendToEnd(editor, text) {
  editor.surface.insertAdjacentHTML('beforeend', textToHtml(text));
  afterContentChange(editor, 'ai-append-end');
}

function applyAIResult(editor, text, mode) {
  const output = String(text || '').trim();
  if (!output) return;

  switch (mode) {
    case 'insert-below':
      insertBelowCurrentBlock(editor, output);
      break;
    case 'append-end':
      appendToEnd(editor, output);
      break;
    case 'replace-selection':
    default:
      replaceSelection(editor, output);
      break;
  }
}

function buildInstruction(action, prompt) {
  const map = {
    improve: 'Improve the writing. Fix grammar, clarity, tone, and flow while preserving meaning.',
    rewrite: 'Rewrite the text so it is cleaner, clearer, and more polished.',
    summarize: 'Summarize the text clearly and concisely.',
    continue: 'Continue the text naturally while keeping the same style and context.',
    translate: 'Translate the text. If a target language is specified, use it.',
    custom: 'Follow the custom instruction exactly.',
  };

  const base = map[action] || map.custom;
  return prompt ? `${base}\n\nAdditional instruction:\n${prompt}` : base;
}

function buildSystemPrompt() {
  return 'You are a writing assistant inside a browser-based rich text editor. Return only the final text for insertion into the document. Do not add explanations, labels, markdown fences, or commentary unless the user explicitly asks for them.';
}

function buildUserMessage({ instruction, selectedText, documentText }) {
  const parts = [instruction];

  if (selectedText) {
    parts.push(`Selected text:\n${selectedText}`);
  }

  if (documentText) {
    parts.push(`Document context:\n${documentText}`);
  }

  if (!selectedText && !documentText) {
    parts.push('No text was selected. Generate output only from the instruction.');
  }

  return parts.join('\n\n');
}

async function parseJsonResponse(response) {
  let json = null;
  let raw = '';

  try {
    raw = await response.text();
  } catch (error) {
    throw new Error('Could not read provider response.');
  }

  try {
    json = raw ? JSON.parse(raw) : null;
  } catch (error) {
    throw new Error('Provider did not return valid JSON.');
  }

  if (!response.ok) {
    const message =
      json?.error?.message ||
      json?.error ||
      json?.message ||
      `Request failed with status ${response.status}.`;
    throw new Error(message);
  }

  return json;
}

function extractOpenAICompatibleText(json) {
  const content = json?.choices?.[0]?.message?.content;

  if (typeof content === 'string') {
    return content.trim();
  }

  if (Array.isArray(content)) {
    return content
      .map((item) => {
        if (typeof item === 'string') return item;
        if (item && typeof item.text === 'string') return item.text;
        return '';
      })
      .join('\n')
      .trim();
  }

  if (typeof json?.output_text === 'string') {
    return json.output_text.trim();
  }

  return '';
}

function extractAnthropicText(json) {
  return (json?.content || [])
    .map((item) => (item?.type === 'text' ? item.text || '' : ''))
    .join('\n')
    .trim();
}

function extractGeminiText(json) {
  return (json?.candidates?.[0]?.content?.parts || [])
    .map((item) => item?.text || '')
    .join('\n')
    .trim();
}

function extractOllamaText(json) {
  if (typeof json?.message?.content === 'string') {
    return json.message.content.trim();
  }
  if (typeof json?.response === 'string') {
    return json.response.trim();
  }
  return '';
}

async function callOpenAICompatible(url, apiKey, model, messages, temperature, extraHeaders = {}) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      ...extraHeaders,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      stream: false,
    }),
  });

  const json = await parseJsonResponse(response);
  const text = extractOpenAICompatibleText(json);

  if (!text) {
    throw new Error('Provider returned no text.');
  }

  return text;
}

async function callAnthropic(apiKey, model, userMessage) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model,
      max_tokens: 1200,
      system: buildSystemPrompt(),
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    }),
  });

  const json = await parseJsonResponse(response);
  const text = extractAnthropicText(json);

  if (!text) {
    throw new Error('Provider returned no text.');
  }

  return text;
}

async function callGemini(apiKey, model, userMessage, temperature) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: buildSystemPrompt() }],
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: userMessage }],
          },
        ],
        generationConfig: {
          temperature,
        },
      }),
    }
  );

  const json = await parseJsonResponse(response);
  const text = extractGeminiText(json);

  if (!text) {
    throw new Error('Provider returned no text.');
  }

  return text;
}

async function callOllama(apiKey, model, userMessage, temperature) {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: buildSystemPrompt() },
        { role: 'user', content: userMessage },
      ],
      stream: false,
      options: {
        temperature,
      },
    }),
  });

  const json = await parseJsonResponse(response);
  const text = extractOllamaText(json);

  if (!text) {
    throw new Error('Provider returned no text.');
  }

  return text;
}

async function callDirectProvider(ai, values, payload) {
  const temperature =
    values.temperature === '' || values.temperature == null
      ? 0.4
      : Number(values.temperature);

  const messages = [
    { role: 'system', content: buildSystemPrompt() },
    { role: 'user', content: payload.userMessage },
  ];

  switch (values.provider) {
    case 'openai':
      return callOpenAICompatible(
        'https://api.openai.com/v1/chat/completions',
        values.apiKey,
        values.model,
        messages,
        temperature
      );

    case 'openrouter':
      return callOpenAICompatible(
        'https://openrouter.ai/api/v1/chat/completions',
        values.apiKey,
        values.model,
        messages,
        temperature,
        {
          ...(ai.openrouterHttpReferer ? { 'HTTP-Referer': ai.openrouterHttpReferer } : {}),
          ...(ai.openrouterXTitle ? { 'X-Title': ai.openrouterXTitle } : {}),
        }
      );

    case 'fireworks':
      return callOpenAICompatible(
        'https://api.fireworks.ai/inference/v1/chat/completions',
        values.apiKey,
        values.model,
        messages,
        temperature
      );

    case 'baseten':
      return callOpenAICompatible(
        'https://inference.baseten.co/v1/chat/completions',
        values.apiKey,
        values.model,
        messages,
        temperature
      );

    case 'anthropic':
      return callAnthropic(values.apiKey, values.model, payload.userMessage);

    case 'google':
      return callGemini(values.apiKey, values.model, payload.userMessage, temperature);

    case 'ollama':
      return callOllama(values.apiKey, values.model, payload.userMessage, temperature);

    default:
      throw new Error('Unsupported provider.');
  }
}

function validateModalValues(ai, values) {
  if (!values.provider) {
    throw new Error('Please select a provider.');
  }

  if (!values.action) {
    throw new Error('Please select an action.');
  }

  if (!values.applyMode) {
    throw new Error('Please choose how to apply the result.');
  }

  if (values.temperature !== '' && values.temperature != null) {
    const n = Number(values.temperature);
    if (!Number.isFinite(n) || n < 0 || n > 2) {
      throw new Error('Temperature must be between 0 and 2.');
    }
  }

  if (!ai.useBackend) {
    const needsApiKey = values.provider !== 'ollama';
    if (needsApiKey && !String(values.apiKey || '').trim()) {
      throw new Error('API key is required in direct browser mode.');
    }

    if (!String(values.model || '').trim()) {
      throw new Error('Model is required in direct browser mode.');
    }
  }
}

function ensureAIModalStyles() {
  if (document.getElementById('mnb-ai-modal-styles')) return;

  const style = document.createElement('style');
  style.id = 'mnb-ai-modal-styles';
  style.textContent = `
    .mnb-ai-overlay {
      background: rgba(15, 23, 42, 0.46);
      backdrop-filter: blur(6px);
      padding: 16px;
      box-sizing: border-box;
    }

    .mnb-ai-modal {
      width: min(980px, calc(100vw - 32px));
      max-width: 980px;
      max-height: calc(100vh - 32px);
      border: 1px solid #e2e8f0;
      border-radius: 20px;
      overflow: hidden;
      background: #ffffff;
      box-shadow:
        0 24px 60px rgba(15, 23, 42, 0.18),
        0 8px 20px rgba(15, 23, 42, 0.08);
      display: flex;
      flex-direction: column;
    }

    .mnb-ai-form {
      display: flex;
      flex-direction: column;
      min-height: 0;
      height: 100%;
    }

    .mnb-ai-head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 16px;
      padding: 20px 22px 16px;
      border-bottom: 1px solid #edf2f7;
      background: #ffffff;
      flex: 0 0 auto;
    }

    .mnb-ai-head-copy {
      min-width: 0;
    }

    .mnb-ai-head-meta {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-bottom: 10px;
    }

    .mnb-ai-eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 10px;
      border-radius: 999px;
      background: #eff6ff;
      color: #1d4ed8;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    .mnb-ai-eyebrow::before {
      content: "";
      width: 8px;
      height: 8px;
      border-radius: 999px;
      background: #2563eb;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.12);
    }

    .mnb-ai-mode-chip {
      display: inline-flex;
      align-items: center;
      padding: 6px 10px;
      border-radius: 999px;
      background: #eff6ff;
      color: #1d4ed8;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      border: 1px solid #dbeafe;
    }

    .mnb-ai-head h3 {
      margin: 0 0 6px;
      color: #0f172a;
      font-size: 24px;
      line-height: 1.15;
      letter-spacing: -0.03em;
    }

    .mnb-ai-head p {
      margin: 0;
      color: #64748b;
      font-size: 14px;
      line-height: 1.6;
      max-width: 720px;
    }

    .mnb-ai-close {
      appearance: none;
      border: 1px solid #e2e8f0;
      background: #ffffff;
      color: #475569;
      width: 40px;
      height: 40px;
      border-radius: 12px;
      font-size: 20px;
      line-height: 1;
      cursor: pointer;
      transition: background 0.18s ease, color 0.18s ease, border-color 0.18s ease, transform 0.18s ease;
      flex: 0 0 auto;
    }

    .mnb-ai-close:hover {
      background: #f8fafc;
      color: #0f172a;
      border-color: #cbd5e1;
      transform: translateY(-1px);
    }

    .mnb-ai-body {
      padding: 18px 22px;
      display: flex;
      flex-direction: column;
      gap: 16px;
      background: #ffffff;
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      overscroll-behavior: contain;
    }

    .mnb-ai-grid {
      display: grid;
      gap: 14px;
    }

    .mnb-ai-grid.cols-3 {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }

    .mnb-ai-grid.cols-2 {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .mnb-ai-grid.cols-1 {
      grid-template-columns: minmax(0, 1fr);
    }

    .mnb-ai-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
      min-width: 0;
    }

    .mnb-ai-label-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-height: 20px;
    }

    .mnb-ai-label-row strong {
      color: #0f172a;
      font-size: 13px;
      font-weight: 700;
      letter-spacing: -0.01em;
    }

    .mnb-ai-label-row small {
      color: #94a3b8;
      font-size: 11px;
      font-weight: 600;
    }

    .mnb-ai-input,
    .mnb-ai-select,
    .mnb-ai-textarea {
      width: 100%;
      border: 1px solid #dbe2ea;
      border-radius: 14px;
      background: #ffffff;
      color: #0f172a;
      font-size: 14px;
      line-height: 1.45;
      outline: none;
      transition: border-color 0.18s ease, box-shadow 0.18s ease, background 0.18s ease;
      box-sizing: border-box;
    }

    .mnb-ai-input,
    .mnb-ai-select {
      min-height: 46px;
      padding: 0 14px;
    }

    .mnb-ai-textarea {
      min-height: 120px;
      padding: 12px 14px;
      resize: vertical;
    }

    .mnb-ai-input:hover,
    .mnb-ai-select:hover,
    .mnb-ai-textarea:hover {
      border-color: #cbd5e1;
    }

    .mnb-ai-input:focus,
    .mnb-ai-select:focus,
    .mnb-ai-textarea:focus {
      border-color: #60a5fa;
      box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.10);
      background: #ffffff;
    }

    .mnb-ai-note {
      margin-top: 2px;
      color: #64748b;
      font-size: 12px;
      line-height: 1.55;
    }

    .mnb-ai-direct-row {
      display: none;
    }

    .mnb-ai-direct-row.is-visible {
      display: grid;
    }

    .mnb-ai-check-card {
      display: flex;
      align-items: center;
      min-height: 46px;
      padding: 12px 14px;
      border: 1px solid #dbe2ea;
      border-radius: 14px;
      background: #f8fafc;
      box-sizing: border-box;
      height: 100%;
    }

    .mnb-ai-check {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
      cursor: pointer;
      user-select: none;
    }

    .mnb-ai-check input {
      margin: 0;
      width: 17px;
      height: 17px;
      accent-color: #2563eb;
      flex: 0 0 auto;
    }

    .mnb-ai-check-copy {
      display: flex;
      flex-direction: column;
      gap: 3px;
      min-width: 0;
    }

    .mnb-ai-check-copy strong {
      color: #0f172a;
      font-size: 13px;
      font-weight: 700;
      line-height: 1.35;
    }

    .mnb-ai-check-copy small {
      color: #64748b;
      font-size: 12px;
      line-height: 1.5;
    }

    .mnb-ai-foot {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 14px;
      flex-wrap: wrap;
      padding: 16px 22px 20px;
      border-top: 1px solid #edf2f7;
      background: #fcfdff;
      flex: 0 0 auto;
    }

    .mnb-ai-foot-note {
      color: #64748b;
      font-size: 12px;
      line-height: 1.5;
    }

    .mnb-ai-actions {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
      margin-left: auto;
    }

    .mnb-ai-btn {
      appearance: none;
      min-height: 44px;
      padding: 0 16px;
      border-radius: 12px;
      font-size: 14px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.18s ease, box-shadow 0.18s ease, border-color 0.18s ease, background 0.18s ease;
    }

    .mnb-ai-btn.secondary {
      border: 1px solid #dbe2ea;
      background: #ffffff;
      color: #334155;
    }

    .mnb-ai-btn.secondary:hover {
      background: #f8fafc;
      border-color: #cbd5e1;
      transform: translateY(-1px);
    }

    .mnb-ai-btn.primary {
      border: 1px solid #1d4ed8;
      background: #2563eb;
      color: #ffffff;
      box-shadow: 0 10px 22px rgba(37, 99, 235, 0.20);
    }

    .mnb-ai-btn.primary:hover {
      background: #1d4ed8;
      transform: translateY(-1px);
      box-shadow: 0 14px 26px rgba(37, 99, 235, 0.24);
    }

    @media (max-width: 860px) {
      .mnb-ai-grid.cols-3,
      .mnb-ai-grid.cols-2 {
        grid-template-columns: 1fr;
      }

      .mnb-ai-modal {
        width: min(100vw - 20px, 980px);
        max-height: calc(100vh - 20px);
      }

      .mnb-ai-head,
      .mnb-ai-body,
      .mnb-ai-foot {
        padding-left: 16px;
        padding-right: 16px;
      }

      .mnb-ai-head h3 {
        font-size: 21px;
      }

      .mnb-ai-foot {
        flex-direction: column;
        align-items: stretch;
      }

      .mnb-ai-actions {
        margin-left: 0;
        width: 100%;
      }

      .mnb-ai-btn {
        flex: 1 1 auto;
      }
    }
  `;
  document.head.appendChild(style);
}

function buildOptions(options = []) {
  return (options || [])
    .map((opt) => {
      const item = typeof opt === 'string' ? { label: opt, value: opt } : opt;
      return `<option value="${escapeHtml(item.value)}">${escapeHtml(item.label)}</option>`;
    })
    .join('');
}

function getLastDirectState(editor, ai) {
  const fromEditor = editor.__mnbAIDirectState || {};
  const fromConfig = ai.lastApiKeys || {};

  return {
    provider: fromEditor.provider || ai.defaultProvider,
    apiKeys: {
      ...fromConfig,
      ...(fromEditor.apiKeys || {}),
    },
    models: {
      ...(fromEditor.models || {}),
    },
  };
}

function saveLastDirectState(editor, values) {
  const state = editor.__mnbAIDirectState || { apiKeys: {}, models: {} };

  state.provider = values.provider;
  state.apiKeys = {
    ...(state.apiKeys || {}),
    ...(values.apiKey ? { [values.provider]: values.apiKey } : {}),
  };
  state.models = {
    ...(state.models || {}),
    ...(values.model ? { [values.provider]: values.model } : {}),
  };

  editor.__mnbAIDirectState = state;
}

async function openAIIntegrationModal(editor, ai) {
  ensureAIModalStyles();

  return new Promise((resolve) => {
    editor.captureSelection?.();

    const directState = getLastDirectState(editor, ai);

    editor.modalHost.hidden = false;
    editor.modalHost.innerHTML = '';

    const overlay = document.createElement('div');
    overlay.className = 'mnb-modal-overlay mnb-ai-overlay';

    const modal = document.createElement('div');
    modal.className = 'mnb-modal mnb-ai-modal';
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-label', 'AI Integration');

    const form = document.createElement('form');
    form.className = 'mnb-ai-form';
    form.innerHTML = `
      <div class="mnb-ai-head">
        <div class="mnb-ai-head-copy">
          <div class="mnb-ai-head-meta">
            <div class="mnb-ai-eyebrow">AI Assistant</div>
            <div class="mnb-ai-mode-chip">${ai.useBackend ? 'Backend mode' : 'Direct browser mode'}</div>
          </div>
          <h3>AI Integration</h3>
          <p>Choose a provider, set the action, and insert the result directly into the editor.</p>
        </div>
        <button type="button" class="mnb-ai-close" aria-label="Close">×</button>
      </div>

      <div class="mnb-ai-body">
        <div class="mnb-ai-grid cols-3">
          <div class="mnb-ai-field">
            <div class="mnb-ai-label-row">
              <strong>Provider</strong>
              <small>AI service</small>
            </div>
            <select name="provider" class="mnb-ai-select">
              ${buildOptions(ai.providers)}
            </select>
          </div>

          <div class="mnb-ai-field">
            <div class="mnb-ai-label-row">
              <strong>Action</strong>
              <small>Task</small>
            </div>
            <select name="action" class="mnb-ai-select">
              ${buildOptions(ACTION_OPTIONS)}
            </select>
          </div>

          <div class="mnb-ai-field">
            <div class="mnb-ai-label-row">
              <strong>Temperature</strong>
              <small>0 to 2</small>
            </div>
            <input
              name="temperature"
              class="mnb-ai-input"
              type="number"
              min="0"
              max="2"
              step="0.1"
              value="${escapeHtml(ai.defaultTemperature)}"
              placeholder="0.4"
            />
          </div>
        </div>

        <div class="mnb-ai-field">
          <div class="mnb-ai-label-row">
            <strong>Prompt / Instructions</strong>
            <small>Optional guidance</small>
          </div>
          <textarea
            name="prompt"
            class="mnb-ai-textarea"
            rows="4"
            placeholder="Example: Rewrite this in a professional tone, keep it concise, and preserve meaning."
          ></textarea>
          <div class="mnb-ai-note">
            Add tone, format, language, or any extra instruction you want the model to follow.
          </div>
        </div>

        <div class="mnb-ai-grid cols-2 mnb-ai-direct-row${ai.useBackend ? '' : ' is-visible'}" data-direct-row>
          <div class="mnb-ai-field">
            <div class="mnb-ai-label-row">
              <strong>API key${ai.useBackend ? ' (optional)' : ''}</strong>
              <small data-api-key-hint>${ai.useBackend ? 'Not needed in backend mode' : 'Required for most direct providers'}</small>
            </div>
            <input
              name="apiKey"
              class="mnb-ai-input"
              type="password"
              value=""
              placeholder="Enter provider API key"
              autocomplete="off"
              spellcheck="false"
            />
          </div>

          <div class="mnb-ai-field">
            <div class="mnb-ai-label-row">
              <strong>Model override (${ai.useBackend ? 'optional' : 'required'})</strong>
              <small data-model-hint>${ai.useBackend ? 'Uses backend default if empty' : 'Required in direct browser mode'}</small>
            </div>
            <input
              name="model"
              class="mnb-ai-input"
              type="text"
              value=""
              placeholder="Example: gpt-4.1-mini / gemini-2.5-flash / llama3.2"
            />
          </div>
        </div>

        <div class="mnb-ai-grid cols-2">
          <div class="mnb-ai-field">
            <div class="mnb-ai-label-row">
              <strong>Apply result</strong>
              <small>Insert mode</small>
            </div>
            <select name="applyMode" class="mnb-ai-select">
              ${buildOptions(APPLY_OPTIONS)}
            </select>
          </div>

          <div class="mnb-ai-check-card">
            <label class="mnb-ai-check">
              <input name="includeDocument" type="checkbox" />
              <span class="mnb-ai-check-copy">
                <strong>Send full document text as context</strong>
                <small>Use this when the selected text depends on the rest of the document.</small>
              </span>
            </label>
          </div>
        </div>
      </div>

      <div class="mnb-ai-foot">
        <div class="mnb-ai-foot-note">
          ${ai.useBackend
            ? 'Request is sent through your PHP backend endpoint.'
            : 'Request is sent directly from the browser to the selected provider.'}
        </div>

        <div class="mnb-ai-actions">
          <button type="button" class="mnb-ai-btn secondary" data-cancel>Cancel</button>
          <button type="submit" class="mnb-ai-btn primary">Run AI</button>
        </div>
      </div>
    `;

    const providerInput = form.elements.provider;
    const actionInput = form.elements.action;
    const temperatureInput = form.elements.temperature;
    const promptInput = form.elements.prompt;
    const apiKeyInput = form.elements.apiKey;
    const modelInput = form.elements.model;
    const applyModeInput = form.elements.applyMode;
    const includeDocumentInput = form.elements.includeDocument;
    const directRow = form.querySelector('[data-direct-row]');
    const apiKeyHint = form.querySelector('[data-api-key-hint]');
    const modelHint = form.querySelector('[data-model-hint]');

    providerInput.value = directState.provider || ai.defaultProvider;
    actionInput.value = ai.defaultAction;
    applyModeInput.value = ai.defaultApplyMode;
    includeDocumentInput.checked = Boolean(ai.includeDocumentDefault);

    function updateDirectUI() {
      const provider = providerInput.value;
      const isDirect = !ai.useBackend;
      const isOllama = provider === 'ollama';

      if (directRow) {
        directRow.classList.toggle('is-visible', isDirect);
      }

      if (!isDirect) {
        apiKeyInput.value = '';
        modelInput.value = '';
        return;
      }

      apiKeyInput.value = directState.apiKeys?.[provider] || '';
      modelInput.value = directState.models?.[provider] || '';

      if (apiKeyHint) {
        apiKeyHint.textContent = isOllama
          ? 'Optional for local Ollama'
          : (DIRECT_PROVIDER_HINTS[provider] || 'Required in direct mode');
      }

      if (modelHint) {
        modelHint.textContent = 'Required in direct browser mode';
      }

      apiKeyInput.placeholder = isOllama
        ? 'Optional for local Ollama, required for cloud/authenticated Ollama'
        : 'Enter provider API key';

      modelInput.placeholder =
        provider === 'openai' ? 'Example: gpt-4.1-mini'
        : provider === 'anthropic' ? 'Example: claude-sonnet-4-5'
        : provider === 'google' ? 'Example: gemini-2.5-flash'
        : provider === 'openrouter' ? 'Example: openai/gpt-4.1-mini'
        : provider === 'fireworks' ? 'Example: accounts/fireworks/models/llama4-scout-instruct-basic'
        : provider === 'baseten' ? 'Example: deepseek-ai/DeepSeek-V3'
        : provider === 'ollama' ? 'Example: llama3.2'
        : 'Enter model name';
    }

    updateDirectUI();
    providerInput.addEventListener('change', updateDirectUI);

    let finished = false;

    const cleanup = () => {
      document.removeEventListener('keydown', onKeyDown);
      editor.modalHost.hidden = true;
      editor.modalHost.innerHTML = '';
      editor.focus?.();
    };

    const closeWith = (value) => {
      if (finished) return;
      finished = true;
      cleanup();
      resolve(value);
    };

    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeWith(null);
      }
    };

    document.addEventListener('keydown', onKeyDown);

    form.querySelector('.mnb-ai-close').addEventListener('click', () => {
      closeWith(null);
    });

    form.querySelector('[data-cancel]').addEventListener('click', () => {
      closeWith(null);
    });

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) {
        closeWith(null);
      }
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();

      closeWith({
        provider: providerInput.value,
        action: actionInput.value,
        temperature: temperatureInput.value,
        prompt: promptInput.value,
        apiKey: apiKeyInput.value,
        model: modelInput.value,
        applyMode: applyModeInput.value,
        includeDocument: includeDocumentInput.checked,
      });
    });

    modal.appendChild(form);
    overlay.appendChild(modal);
    editor.modalHost.appendChild(overlay);

    setTimeout(() => providerInput.focus(), 10);
  });
}

export default buttonTool({
  id: 'ai-integration',
  label: 'AI',
  title: 'AI Integration',
  icon: '🤖',
  description:
    'Use AI providers from your PHP backend or directly from the browser to improve, rewrite, summarize, translate, or continue text.',
  async run(editor) {
    const ai = getAIConfig(editor);
    const selectedText = editor.getSelectedText?.() || '';
    const values = await openAIIntegrationModal(editor, ai);

    if (!values) return;

    try {
      validateModalValues(ai, values);

      const instruction = buildInstruction(values.action, values.prompt || '');
      const userMessage = buildUserMessage({
        instruction,
        selectedText,
        documentText: values.includeDocument ? editor.getText?.() || '' : '',
      });

      editor.alert(ai.useBackend ? 'Running AI request…' : 'Running direct AI request…', 'info', 1600);

      let resultText = '';

      if (ai.useBackend) {
        const response = await fetch(ai.endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            provider: values.provider,
            action: values.action,
            prompt: values.prompt || '',
            selectedText,
            documentText: values.includeDocument ? editor.getText?.() || '' : '',
            model: values.model || '',
            temperature: values.temperature === '' ? null : Number(values.temperature),
          }),
        });

        const result = await parseJsonResponse(response);
        resultText = String(result?.text || '').trim();

        if (!resultText) {
          throw new Error('AI backend returned an empty response.');
        }
      } else {
        saveLastDirectState(editor, values);

        resultText = await callDirectProvider(ai, values, {
          userMessage,
        });

        if (!resultText) {
          throw new Error('Direct provider returned an empty response.');
        }
      }

      applyAIResult(editor, resultText, values.applyMode);

      editor.alert(
        `${getProviderLabel(ai.providers, values.provider)} response inserted.`,
        'success',
        2200
      );
    } catch (error) {
      editor.alert(error?.message || 'AI request failed.', 'error', 3200);
      console.error('AI Integration Error:', error);
    }
  },
});