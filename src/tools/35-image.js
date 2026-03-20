import { buttonTool } from '../core/toolkit.js';

function escapeAttr(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

function normalizeWidth(value, fallback = 480) {
  const width = Number(value);
  if (!Number.isFinite(width)) return fallback;
  return Math.max(40, Math.min(1400, width));
}

function readUploadUrl(payload) {
  return (
    payload?.url ||
    payload?.data?.url ||
    payload?.result?.url ||
    payload?.location ||
    payload?.path ||
    ''
  );
}

async function uploadImageViaApi(editor, file) {
  const endpoint = editor.options.imageUploadEndpoint;
  if (!endpoint) {
    throw new Error('Image upload endpoint is not configured.');
  }

  const fieldName = editor.options.imageUploadFieldName || 'image';
  const method = editor.options.imageUploadMethod || 'POST';
  const credentials = editor.options.imageUploadCredentials || 'same-origin';
  const extraFields = editor.options.imageUploadExtraFields || {};
  const headers = editor.options.imageUploadHeaders || {};

  const formData = new FormData();
  formData.append(fieldName, file, file.name || 'image');

  Object.entries(extraFields).forEach(([key, value]) => {
    formData.append(key, value);
  });

  const response = await fetch(endpoint, {
    method,
    body: formData,
    headers,
    credentials,
  });

  const text = await response.text();
  let payload = {};

  try {
    payload = text ? JSON.parse(text) : {};
  } catch {
    payload = {};
  }

  if (!response.ok) {
    throw new Error(payload?.message || `Image upload failed (${response.status}).`);
  }

  const url = readUploadUrl(payload);
  if (!url) {
    throw new Error('Upload API did not return an image URL.');
  }

  return url;
}

export default buttonTool({
  id: 'image',
  label: 'Image',
  icon: '🖼',
  title: 'Image',
  async run(editor) {
    const values = await editor.form('Insert Image', [
      {
        name: 'mode',
        label: 'Source',
        type: 'select',
        value: 'url',
        options: [
          { label: 'URL', value: 'url' },
          { label: 'Upload', value: 'upload' },
        ],
      },
      {
        name: 'url',
        label: 'Image URL',
        type: 'text',
        value: '',
        placeholder: 'https://...',
        showWhen: { field: 'mode', equals: 'url' },
      },
      {
        name: 'file',
        label: 'Upload Image',
        type: 'file',
        accept: 'image/*',
        showWhen: { field: 'mode', equals: 'upload' },
      },
      {
        name: 'alt',
        label: 'Alt text',
        type: 'text',
        value: 'Image',
      },
      {
        name: 'width',
        label: 'Width in px',
        type: 'number',
        value: '480',
        min: '40',
        max: '1400',
      },
      {
        name: 'caption',
        label: 'Caption',
        type: 'text',
        value: '',
        placeholder: 'Optional caption',
      },
    ], { submitText: 'Insert' });

    if (!values) return;

    let src = '';
    const width = normalizeWidth(values.width, 480);
    const alt = values.alt || 'Image';
    const caption = (values.caption || '').trim();

    if (values.mode === 'upload') {
      const file = values.file;

      if (!file) {
        editor.alert('Please choose an image file.', 'error');
        return;
      }

      if (!file.type || !file.type.startsWith('image/')) {
        editor.alert('Please choose a valid image file.', 'error');
        return;
      }

      try {
        if (editor.options.imageUploadEndpoint) {
          src = await uploadImageViaApi(editor, file);
        } else {
          src = await toDataUrl(file);
        }
      } catch (error) {
        editor.alert(error.message || 'Image upload failed.', 'error');
        return;
      }
    } else {
      src = String(values.url || '').trim();
      if (!src) {
        editor.alert('Please enter an image URL.', 'error');
        return;
      }
    }

    const imgHtml = `
      <img
        src="${escapeAttr(src)}"
        alt="${escapeAttr(alt)}"
        style="width:${width}px;max-width:100%;height:auto;border-radius:16px;display:block;"
      />
    `;

    const html = caption
      ? `
        <figure style="margin:16px 0;">
          ${imgHtml}
          <figcaption style="margin-top:8px;font-size:14px;color:#6b7280;">
            ${escapeAttr(caption)}
          </figcaption>
        </figure>
      `
      : imgHtml;

    editor.insertHTML(html);
    editor.alert('Image inserted.', 'success');
  },
});