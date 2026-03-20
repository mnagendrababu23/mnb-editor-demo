import { selectTool } from '../core/toolkit.js';

const UPLOAD_VALUE = '__upload__';
const DEFAULT_ACCEPT = '.ttf,.otf,.woff,.woff2';

const baseFamilies = [
  { label: 'Inter', value: 'Inter, Arial, sans-serif' },
  { label: 'Arial', value: 'Arial, sans-serif' },
  { label: 'Georgia', value: 'Georgia, serif' },
  { label: 'Times New Roman', value: '"Times New Roman", serif' },
  { label: 'Poppins', value: 'Poppins, Arial, sans-serif' },
  { label: 'Roboto', value: 'Roboto, Arial, sans-serif' },
  { label: 'Monospace', value: 'ui-monospace, SFMono-Regular, Menlo, monospace' },
];

function getFontFamilySettings(editor) {
  return editor?.options?.fontFamily || {};
}

function isFontFile(file) {
  if (!file?.name) return false;
  return /\.(ttf|otf|woff2?)$/i.test(file.name);
}

function getUploadedFontOptions(editor) {
  const fonts = editor?.getRegisteredFonts?.() || [];

  return fonts.map((item) => ({
    label: item.family,
    value: item.value || `"${item.family}"`,
  }));
}

function dedupeOptions(list = []) {
  const seen = new Set();
  return list.filter((item) => {
    const key = `${item.label}::${item.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function buildOptions(editor) {
  const settings = getFontFamilySettings(editor);
  const uploadedFonts = getUploadedFontOptions(editor);

  const options = dedupeOptions([
    ...baseFamilies,
    ...uploadedFonts,
  ]);

  if (settings.enableUpload) {
    options.push({
      label: settings.uploadLabel || 'Upload TTF / OTF',
      value: UPLOAD_VALUE,
    });
  }

  return options;
}

async function uploadFonts(editor) {
  const settings = getFontFamilySettings(editor);
  const accept = settings.accept || DEFAULT_ACCEPT;
  const askUploadFolder = settings.askUploadFolder !== false;

  const picked = await editor.pickFiles({
    accept,
    multiple: true,
    directory: askUploadFolder,
  });

  const files = (Array.isArray(picked) ? picked : [picked]).filter(Boolean);
  const fontFiles = files.filter(isFontFile);

  if (!fontFiles.length) {
    editor.alert('No valid font files were selected.', 'info');
    return null;
  }

  const loadedFamilies = [];

  for (const file of fontFiles) {
    try {
      const family = await editor.registerFontFace('', file);
      if (family) loadedFamilies.push(family);
    } catch (error) {
      editor?.log?.('error', `Failed to load font file "${file.name}".`, {
        message: error?.message || String(error),
      });
    }
  }

  if (!loadedFamilies.length) {
    editor.alert('Font upload failed.', 'error');
    return null;
  }

  return loadedFamilies;
}

const tool = selectTool({
  id: 'font-family',
  label: 'Font Family',
  title: 'Font Family',
  value: baseFamilies[0].value,
  options: [...baseFamilies],
  onRendered(editor, element) {
    tool.options = buildOptions(editor);

    const labelNode = element?.querySelector('.mnb-tool-value');
    if (labelNode) {
      const active = tool.options.find((item) => item.value === tool.value);
      labelNode.textContent = active?.label || 'Font Family';
    }
  },
  async run(editor, value) {
    tool.options = buildOptions(editor);

    if (value === UPLOAD_VALUE) {
      const loadedFamilies = await uploadFonts(editor);
      if (!loadedFamilies?.length) {
        tool.options = buildOptions(editor);
        return;
      }

      tool.options = buildOptions(editor);

      const lastFamily = loadedFamilies[loadedFamilies.length - 1];
      const appliedValue = `"${lastFamily}"`;

      tool.value = appliedValue;
      editor.setFontFamily(appliedValue, { silent: true });
      editor.alert(
        loadedFamilies.length === 1
          ? `Custom font "${lastFamily}" loaded.`
          : `${loadedFamilies.length} custom fonts loaded. Applied "${lastFamily}".`,
        'success'
      );
      return;
    }

    tool.value = value;
    editor.setFontFamily(value);
  },
});

export default tool;
