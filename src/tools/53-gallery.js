import { buttonTool } from '../core/toolkit.js';

function escapeAttr(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function createGalleryId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `mnb-${crypto.randomUUID()}`;
  }
  return `mnb-${Math.random().toString(36).slice(2, 10)}`;
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

function toDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file.'));
    reader.readAsDataURL(file);
  });
}

async function uploadGalleryImageViaApi(editor, file) {
  const endpoint = editor.options.galleryUploadEndpoint;
  if (!endpoint) {
    throw new Error('Gallery upload endpoint is not configured.');
  }

  const fieldName = editor.options.galleryUploadFieldName || 'image';
  const method = editor.options.galleryUploadMethod || 'POST';
  const credentials = editor.options.galleryUploadCredentials || 'same-origin';
  const headers = editor.options.galleryUploadHeaders || {};
  const extraFields = editor.options.galleryUploadExtraFields || {};

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

function getSelectionNode(editor) {
  const selection = window.getSelection();
  let node = null;

  if (selection && selection.rangeCount) {
    node = selection.getRangeAt(0).commonAncestorContainer;
  } else if (editor.currentRange) {
    node = editor.currentRange.commonAncestorContainer;
  }

  if (!node) return null;
  return node.nodeType === Node.TEXT_NODE ? node.parentNode : node;
}

function getGalleryContainer(editor) {
  const node = getSelectionNode(editor) || editor.getSelectedBlock?.();
  if (!node) return null;

  const direct =
    node.closest?.('[data-mnb-gallery="true"]') ||
    node.closest?.('.mnb-gallery');

  if (direct) return direct;

  const fallback = node.closest?.('.mnb-columns');
  if (fallback && fallback.querySelector('img')) return fallback;

  return null;
}

function getGalleryCard(editor) {
  const node = getSelectionNode(editor) || editor.getSelectedBlock?.();
  if (!node) return null;

  const card =
    node.closest?.('.mnb-gallery-card') ||
    node.closest?.('.mnb-card');

  if (!card) return null;

  const gallery = getGalleryContainer(editor);
  if (!gallery || !gallery.contains(card)) return null;

  return card;
}

function getGalleryImageCount(gallery) {
  if (!gallery) return 0;
  return gallery.querySelectorAll('.mnb-gallery-card, .mnb-card').length;
}

function ensureGalleryId(gallery) {
  if (!gallery) return '';
  let id = gallery.getAttribute('data-mnb-gallery-id') || gallery.id || '';
  if (!id) {
    id = createGalleryId();
    gallery.id = id;
    gallery.setAttribute('data-mnb-gallery-id', id);
  } else {
    gallery.id = id;
    gallery.setAttribute('data-mnb-gallery-id', id);
  }
  return id;
}

function buildGalleryCards(urls, imageHeight = 220) {
  return urls.map((src) => `
    <div class="mnb-gallery-card mnb-card">
      <img
        src="${escapeAttr(src)}"
        alt="Gallery image"
        style="width:100%;height:${imageHeight}px;object-fit:cover;object-position:center;border-radius:14px;display:block;"
      />
    </div>
  `).join('');
}

function createGalleryHtml(urls, columns, gap, imageHeight) {
  const galleryId = createGalleryId();

  return `
    <div
      id="${escapeAttr(galleryId)}"
      class="mnb-gallery mnb-columns"
      data-mnb-gallery="true"
      data-mnb-gallery-id="${escapeAttr(galleryId)}"
      data-mnb-gallery-height="${imageHeight}"
      style="grid-template-columns:repeat(${columns}, minmax(0, 1fr));gap:${gap}px;"
    >
      ${buildGalleryCards(urls, imageHeight)}
    </div>
    <p><br></p>
  `;
}

function getExistingGalleryColumns(gallery) {
  const inline = gallery?.style?.gridTemplateColumns || '';
  const match = inline.match(/repeat\((\d+)/);
  return match?.[1] || '3';
}

function getExistingGalleryGap(gallery) {
  const gap = gallery?.style?.gap || '';
  return gap ? gap.replace('px', '') : '16';
}

function getExistingGalleryHeight(gallery) {
  const attr = gallery?.dataset?.mnbGalleryHeight;
  if (attr) return attr;

  const img = gallery?.querySelector('img');
  if (!img) return '220';

  const styleHeight = img.style.height || '';
  return styleHeight ? styleHeight.replace('px', '') : '220';
}

export default buttonTool({
  id: 'gallery',
  label: 'Gallery',
  icon: '🗂',
  title: 'Gallery',
  async run(editor) {
    const existingGallery = getGalleryContainer(editor);
    const selectedCard = getGalleryCard(editor);
    const hasGallery = Boolean(existingGallery);
    const hasSelectedImage = Boolean(selectedCard);

    if (existingGallery) {
      ensureGalleryId(existingGallery);
    }

    const actionOptions = [];
    if (hasGallery) {
      actionOptions.push({ label: 'Add to existing gallery', value: 'append' });
    }
    if (hasSelectedImage) {
      actionOptions.push({ label: 'Remove selected image', value: 'remove' });
    }
    actionOptions.push({ label: 'Create new gallery', value: 'new' });

    const defaultAction = hasSelectedImage ? 'remove' : hasGallery ? 'append' : 'new';

    const values = await editor.form('Gallery', [
      {
        name: 'action',
        label: 'Action',
        type: 'select',
        value: defaultAction,
        options: actionOptions,
      },
      {
        name: 'mode',
        label: 'Source mode',
        type: 'select',
        value: 'urls',
        options: [
          { label: 'Paste image URLs', value: 'urls' },
          { label: 'Upload images', value: 'upload' },
        ],
        showWhen: { field: 'action', in: ['new', 'append'] },
      },
      {
        name: 'urls',
        label: 'Image URLs (one per line)',
        type: 'textarea',
        value: '',
        rows: 5,
        placeholder: 'https://example.com/a.jpg\nhttps://example.com/b.png',
        showWhen: (formValues) =>
          ['new', 'append'].includes(formValues.action) && formValues.mode === 'urls',
      },
      {
        name: 'files',
        label: 'Upload images',
        type: 'file',
        accept: 'image/*',
        multiple: true,
        showWhen: (formValues) =>
          ['new', 'append'].includes(formValues.action) && formValues.mode === 'upload',
        note: 'You can select multiple images.',
        filePlaceholder: 'No files selected',
      },
      {
        name: 'columns',
        label: 'Columns',
        type: 'select',
        value: getExistingGalleryColumns(existingGallery),
        options: ['2', '3', '4'],
        showWhen: { field: 'action', equals: 'new' },
      },
      {
        name: 'gap',
        label: 'Gap in px',
        type: 'number',
        value: getExistingGalleryGap(existingGallery),
        min: '0',
        max: '60',
        showWhen: { field: 'action', equals: 'new' },
      },
      {
        name: 'imageHeight',
        label: 'Image height in px',
        type: 'number',
        value: getExistingGalleryHeight(existingGallery),
        min: '80',
        max: '600',
        showWhen: (formValues) => ['new', 'append'].includes(formValues.action),
        note: 'Recommended: 180 to 260 px',
      },
    ], {
      submitText: 'Apply',
      description: hasGallery
        ? `Current gallery id: ${ensureGalleryId(existingGallery)}`
        : 'Create a gallery using image URLs or uploaded images.',
    });

    if (!values) return;

    if (values.action === 'remove') {
      if (!selectedCard || !existingGallery) {
        editor.alert('Place the caret on a gallery image to remove it.', 'error');
        return;
      }

      const galleryId = ensureGalleryId(existingGallery);
      selectedCard.remove();

      const countAfter = getGalleryImageCount(existingGallery);

      if (countAfter === 0) {
        const next = existingGallery.nextElementSibling;
        if (next && next.tagName === 'P' && !next.textContent.trim()) {
          next.remove();
        }
        existingGallery.remove();
        editor.saveHistory?.('gallery-remove-last-image');
        editor.refreshStatus?.();
        editor.alert(`Last image removed. Gallery ${galleryId} removed too.`, 'success');
        return;
      }

      editor.saveHistory?.('gallery-remove-image');
      editor.refreshStatus?.();
      editor.alert(`Image removed from ${galleryId}.`, 'success');
      return;
    }

    let urls = [];

    if (values.mode === 'upload') {
      const files = Array.isArray(values.files) ? values.files : [];
      if (!files.length) {
        editor.alert('Please choose one or more images.', 'error');
        return;
      }

      const invalid = files.find((file) => !file.type || !file.type.startsWith('image/'));
      if (invalid) {
        editor.alert(`Invalid image file: ${invalid.name}`, 'error');
        return;
      }

      try {
        if (editor.options.galleryUploadEndpoint) {
          urls = await Promise.all(files.map((file) => uploadGalleryImageViaApi(editor, file)));
        } else {
          urls = await Promise.all(files.map((file) => toDataUrl(file)));
        }
      } catch (error) {
        editor.alert(error.message || 'Gallery upload failed.', 'error');
        return;
      }
    } else {
      urls = String(values.urls || '')
        .split('\n')
        .map((item) => item.trim())
        .filter(Boolean);
    }

    if (!urls.length) {
      editor.alert('Please provide at least one image.', 'error');
      return;
    }

    const imageHeight = Math.max(80, Math.min(600, Number(values.imageHeight) || 220));

    if (values.action === 'append' && existingGallery) {
      const galleryId = ensureGalleryId(existingGallery);
      existingGallery.dataset.mnbGalleryHeight = String(imageHeight);
      existingGallery.insertAdjacentHTML('beforeend', buildGalleryCards(urls, imageHeight));
      editor.saveHistory?.('gallery-append');
      editor.refreshStatus?.();
      editor.alert(`Images added to ${galleryId}.`, 'success');
      return;
    }

    editor.insertHTML(createGalleryHtml(
      urls,
      Math.max(2, Math.min(4, Number(values.columns) || 3)),
      Math.max(0, Math.min(60, Number(values.gap) || 16)),
      imageHeight,
    ));
    editor.alert('Gallery inserted with unique id.', 'success');
  },
});