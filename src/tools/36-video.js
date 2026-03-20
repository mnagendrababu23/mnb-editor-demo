import { buttonTool } from '../core/toolkit.js';

function escapeAttr(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function normalizeNumber(value, fallback, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, num));
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

function isDirectVideoUrl(url = '') {
  return /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url);
}

function isYouTubeUrl(url = '') {
  return /youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\//i.test(url);
}

function isVimeoUrl(url = '') {
  return /vimeo\.com\/\d+|player\.vimeo\.com\/video\//i.test(url);
}

function transformVideoUrl(url = '') {
  const clean = String(url).trim();

  if (/youtube\.com\/watch\?v=/.test(clean)) {
    const parsed = new URL(clean);
    const videoId = parsed.searchParams.get('v');
    return videoId ? `https://www.youtube.com/embed/${videoId}` : clean;
  }

  if (/youtu\.be\//.test(clean)) {
    const videoId = clean.split('/').pop()?.split('?')[0];
    return videoId ? `https://www.youtube.com/embed/${videoId}` : clean;
  }

  if (/vimeo\.com\/\d+/.test(clean) && !/player\.vimeo\.com\/video\//.test(clean)) {
    const match = clean.match(/vimeo\.com\/(\d+)/);
    if (match?.[1]) return `https://player.vimeo.com/video/${match[1]}`;
  }

  return clean;
}

async function uploadVideoViaApi(editor, file) {
  const endpoint = editor.options.videoUploadEndpoint;
  if (!endpoint) {
    throw new Error('Video upload endpoint is not configured.');
  }

  const fieldName = editor.options.videoUploadFieldName || 'video';
  const method = editor.options.videoUploadMethod || 'POST';
  const credentials = editor.options.videoUploadCredentials || 'same-origin';
  const extraFields = editor.options.videoUploadExtraFields || {};
  const headers = editor.options.videoUploadHeaders || {};

  const formData = new FormData();
  formData.append(fieldName, file, file.name || 'video');

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
    throw new Error(payload?.message || `Video upload failed (${response.status}).`);
  }

  const url = readUploadUrl(payload);
  if (!url) {
    throw new Error('Upload API did not return a video URL.');
  }

  return url;
}

export default buttonTool({
  id: 'video',
  label: 'Video',
  icon: '🎬',
  title: 'Video',
  async run(editor) {
    const values = await editor.form('Insert Video', [
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
        label: 'Video / Embed URL',
        type: 'text',
        value: '',
        placeholder: 'https://...',
        showWhen: { field: 'mode', equals: 'url' },
      },
      {
        name: 'file',
        label: 'Upload Video',
        type: 'file',
        accept: 'video/*',
        showWhen: { field: 'mode', equals: 'upload' },
      },
      {
        name: 'width',
        label: 'Width in px',
        type: 'number',
        value: '640',
        min: '180',
        max: '1400',
      },
      {
        name: 'height',
        label: 'Height in px',
        type: 'number',
        value: '360',
        min: '120',
        max: '900',
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

    const width = normalizeNumber(values.width, 640, 180, 1400);
    const height = normalizeNumber(values.height, 360, 120, 900);
    const caption = (values.caption || '').trim();

    let src = '';
    let html = '';

    if (values.mode === 'upload') {
      const file = values.file;

      if (!file) {
        editor.alert('Please choose a video file.', 'error');
        return;
      }

      if (!file.type || !file.type.startsWith('video/')) {
        editor.alert('Please choose a valid video file.', 'error');
        return;
      }

      try {
        src = editor.options.videoUploadEndpoint
          ? await uploadVideoViaApi(editor, file)
          : URL.createObjectURL(file);
      } catch (error) {
        editor.alert(error.message || 'Video upload failed.', 'error');
        return;
      }

      html = `
        <video
          src="${escapeAttr(src)}"
          controls
          playsinline
          style="width:${width}px;max-width:100%;height:auto;border-radius:18px;display:block;"
        ></video>
      `;
    } else {
      src = String(values.url || '').trim();

      if (!src) {
        editor.alert('Please enter a video URL.', 'error');
        return;
      }

      if (isYouTubeUrl(src) || isVimeoUrl(src)) {
        const embedSrc = transformVideoUrl(src);
        html = `
          <iframe
            src="${escapeAttr(embedSrc)}"
            width="${width}"
            height="${height}"
            allowfullscreen
            style="border:0;border-radius:18px;max-width:100%;display:block;"
          ></iframe>
        `;
      } else if (isDirectVideoUrl(src)) {
        html = `
          <video
            src="${escapeAttr(src)}"
            controls
            playsinline
            style="width:${width}px;max-width:100%;height:auto;border-radius:18px;display:block;"
          ></video>
        `;
      } else {
        html = `
          <iframe
            src="${escapeAttr(src)}"
            width="${width}"
            height="${height}"
            allowfullscreen
            style="border:0;border-radius:18px;max-width:100%;display:block;"
          ></iframe>
        `;
      }
    }

    const finalHtml = caption
      ? `
        <figure style="margin:16px 0;">
          ${html}
          <figcaption style="margin-top:8px;font-size:14px;color:#6b7280;">
            ${escapeAttr(caption)}
          </figcaption>
        </figure>
      `
      : html;

    editor.insertHTML(finalHtml);
    editor.alert('Video inserted.', 'success');
  },
});