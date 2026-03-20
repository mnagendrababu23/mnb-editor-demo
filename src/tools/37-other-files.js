import { buttonTool } from '../core/toolkit.js';

function escapeAttr(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
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

function inferFileNameFromUrl(url = '') {
  try {
    const parsed = new URL(url, window.location.href);
    return decodeURIComponent(parsed.pathname.split('/').pop() || '') || 'file';
  } catch {
    const clean = String(url).split('?')[0].split('#')[0];
    return decodeURIComponent(clean.split('/').pop() || '') || 'file';
  }
}

function matchesAccept(file, accept = '*/*') {
  const rule = String(accept || '*/*').trim();
  if (!rule || rule === '*/*') return true;

  const fileName = String(file?.name || '').toLowerCase();
  const fileType = String(file?.type || '').toLowerCase();

  return rule
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean)
    .some((part) => {
      if (part === '*/*') return true;
      if (part.startsWith('.')) return fileName.endsWith(part);
      if (part.endsWith('/*')) return fileType.startsWith(`${part.slice(0, -2)}/`);
      return fileType === part;
    });
}

async function uploadOtherFileViaApi(editor, file) {
  const endpoint = editor.options.otherFileUploadEndpoint;
  if (!endpoint) throw new Error('File upload endpoint is not configured.');

  const fieldName = editor.options.otherFileUploadFieldName || 'file';
  const method = editor.options.otherFileUploadMethod || 'POST';
  const credentials = editor.options.otherFileUploadCredentials || 'same-origin';
  const headers = editor.options.otherFileUploadHeaders || {};
  const extraFields = editor.options.otherFileUploadExtraFields || {};

  const formData = new FormData();
  formData.append(fieldName, file, file.name || 'file');

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
    throw new Error(payload?.message || `File upload failed (${response.status}).`);
  }

  const url = readUploadUrl(payload);
  if (!url) throw new Error('Upload API did not return a file URL.');

  return url;
}

export default buttonTool({
  id: 'other-files',
  label: 'Files',
  icon: '📎',
  title: 'Other Files',
  async run(editor) {
    const accept = editor.options.otherFilesAccept || '*/*';

    const values = await editor.form('Insert File', [
      {
        name: 'mode',
        label: 'Source',
        type: 'select',
        value: 'upload',
        options: [
          { label: 'Upload', value: 'upload' },
          { label: 'URL', value: 'url' },
        ],
      },
      {
        name: 'file',
        label: 'Choose File',
        type: 'file',
        accept,
        showWhen: { field: 'mode', equals: 'upload' },
        note: `Allowed file types: ${accept}`,
        filePlaceholder: 'No file selected',
      },
      {
        name: 'url',
        label: 'File URL',
        type: 'text',
        value: '',
        placeholder: 'https://...',
        showWhen: { field: 'mode', equals: 'url' },
      },
      {
        name: 'labelText',
        label: 'Link text',
        type: 'text',
        value: '',
        placeholder: 'Optional link text',
      },
      {
        name: 'newTab',
        label: 'Open in new tab',
        type: 'checkbox',
        value: true,
        inlineGroup: 'file-link-options',
        inlineColumns: 2,
      },
      {
        name: 'download',
        label: 'Add download attribute',
        type: 'checkbox',
        value: true,
        inlineGroup: 'file-link-options',
        inlineColumns: 2,
      },
    ], {
      submitText: 'Insert',
      description: 'Upload a file from your device or add a direct file URL.',
    });

    if (!values) return;

    let href = '';
    let fileName = '';
    let labelText = '';

    if (values.mode === 'upload') {
      const file = values.file;

      if (!file) {
        editor.alert('Please choose a file.', 'error');
        return;
      }

      if (!matchesAccept(file, accept)) {
        editor.alert(`Selected file is not allowed. Allowed: ${accept}`, 'error');
        return;
      }

      try {
        href = editor.options.otherFileUploadEndpoint
          ? await uploadOtherFileViaApi(editor, file)
          : URL.createObjectURL(file);
      } catch (error) {
        editor.alert(error.message || 'File upload failed.', 'error');
        return;
      }

      fileName = file.name || 'file';
      labelText = String(values.labelText || '').trim() || fileName;
    } else {
      href = String(values.url || '').trim();

      if (!href) {
        editor.alert('Please enter a file URL.', 'error');
        return;
      }

      fileName = inferFileNameFromUrl(href);
      labelText = String(values.labelText || '').trim() || fileName || 'Download file';
    }

    const attrs = [`href="${escapeAttr(href)}"`];

    if (values.newTab) {
      attrs.push('target="_blank"', 'rel="noopener noreferrer"');
    }

    if (values.download) {
      attrs.push(`download="${escapeAttr(fileName || labelText || 'file')}"`);
    }

    editor.insertHTML(
      `<p><a ${attrs.join(' ')}>📎 ${escapeHtml(labelText)}</a></p>`
    );

    editor.alert(`Attached ${labelText}.`, 'success');
  },
});