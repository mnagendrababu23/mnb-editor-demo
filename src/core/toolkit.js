export function buttonTool(config) {
  return {
    kind: 'button',
    ...config,
  };
}

export function selectTool(config) {
  return {
    kind: 'select',
    ...config,
  };
}

export async function chooseColor(editor, title, defaultColor = '#111827') {
  const values = await editor.form(title, [
    { name: 'color', label: 'Color', type: 'color', value: defaultColor },
  ]);
  return values?.color || null;
}

export function simpleStyleOptions(list) {
  return list.map((item) => (
    typeof item === 'string' ? { label: item, value: item } : item
  ));
}

function normalizeHexColor(value, fallback = '#111827') {
  const input = String(value || '').trim();

  if (/^#[0-9a-fA-F]{6}$/.test(input)) return input.toLowerCase();
  if (/^[0-9a-fA-F]{6}$/.test(input)) return `#${input.toLowerCase()}`;

  if (/^#[0-9a-fA-F]{3}$/.test(input)) {
    const r = input[1];
    const g = input[2];
    const b = input[3];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  if (/^[0-9a-fA-F]{3}$/.test(input)) {
    const r = input[0];
    const g = input[1];
    const b = input[2];
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return fallback.toLowerCase();
}

function readRecentColors(storageKey) {
  try {
    const raw = localStorage.getItem(storageKey);
    const parsed = JSON.parse(raw || '[]');
    return Array.isArray(parsed)
      ? parsed.filter((v) => /^#[0-9a-fA-F]{6}$/.test(v))
      : [];
  } catch {
    return [];
  }
}

function writeRecentColors(storageKey, colors) {
  try {
    localStorage.setItem(storageKey, JSON.stringify(colors.slice(0, 10)));
  } catch {
    // ignore storage errors
  }
}

function pushRecentColor(storageKey, color) {
  const normalized = normalizeHexColor(color);
  const next = [normalized, ...readRecentColors(storageKey).filter((item) => item !== normalized)];
  writeRecentColors(storageKey, next);
  return next;
}

export function renderColorPickerMenu(editor, ctx, config = {}) {
  const {
    tool,
    menu,
    header,
    list,
    applyValue,
    close,
  } = ctx;

  const {
    title = tool.title || tool.label || 'Color',
    palette = [],
    defaultValue = tool.value || '#111827',
    autoLabel = 'Automatic',
    autoValue = '#111827',
    allowAuto = true,
    recentStorageKey = `mnb-recent-colors:${tool.id}`,
    columns = 5,
  } = config;

  header.textContent = title;

  menu.innerHTML = '';
  menu.style.minWidth = '240px';
  menu.style.padding = '10px';
  menu.style.borderRadius = '12px';

  list.innerHTML = '';
  list.style.display = 'flex';
  list.style.flexDirection = 'column';
  list.style.gap = '10px';

  menu.appendChild(header);
  menu.appendChild(list);

  let selectedColor = normalizeHexColor(
    tool.value || defaultValue,
    normalizeHexColor(defaultValue)
  );

  const previewRow = document.createElement('div');
  previewRow.style.display = 'flex';
  previewRow.style.alignItems = 'center';
  previewRow.style.gap = '10px';

  const previewSwatch = document.createElement('div');
  previewSwatch.style.width = '28px';
  previewSwatch.style.height = '28px';
  previewSwatch.style.borderRadius = '8px';
  previewSwatch.style.border = '1px solid rgba(15,23,42,.12)';
  previewSwatch.style.background = selectedColor;
  previewSwatch.style.flex = '0 0 auto';

  const hexInput = document.createElement('input');
  hexInput.type = 'text';
  hexInput.value = selectedColor;
  hexInput.placeholder = '#000000';
  hexInput.spellcheck = false;
  hexInput.style.flex = '1';
  hexInput.style.minWidth = '0';
  hexInput.style.padding = '8px 10px';
  hexInput.style.borderRadius = '8px';
  hexInput.style.border = '1px solid rgba(15,23,42,.12)';
  hexInput.style.outline = 'none';

  previewRow.appendChild(previewSwatch);
  previewRow.appendChild(hexInput);

  const paletteWrap = document.createElement('div');
  paletteWrap.style.display = 'grid';
  paletteWrap.style.gridTemplateColumns = `repeat(${columns}, 32px)`;
  paletteWrap.style.gap = '6px';
  paletteWrap.style.justifyContent = 'start';

  const footer = document.createElement('div');
  footer.style.display = 'flex';
  footer.style.alignItems = 'center';
  footer.style.justifyContent = 'space-between';
  footer.style.gap = '8px';
  footer.style.flexWrap = 'wrap';

  const leftActions = document.createElement('div');
  leftActions.style.display = 'flex';
  leftActions.style.alignItems = 'center';
  leftActions.style.gap = '8px';

  const rightActions = document.createElement('div');
  rightActions.style.display = 'flex';
  rightActions.style.alignItems = 'center';
  rightActions.style.gap = '8px';

  const pickerLabel = document.createElement('label');
  pickerLabel.style.display = 'inline-flex';
  pickerLabel.style.alignItems = 'center';
  pickerLabel.style.gap = '8px';
  pickerLabel.style.padding = '7px 10px';
  pickerLabel.style.borderRadius = '8px';
  pickerLabel.style.border = '1px solid rgba(15,23,42,.12)';
  pickerLabel.style.background = '#fff';
  pickerLabel.style.cursor = 'pointer';
  pickerLabel.textContent = 'Picker';

  const picker = document.createElement('input');
  picker.type = 'color';
  picker.value = selectedColor;
  picker.style.width = '20px';
  picker.style.height = '20px';
  picker.style.padding = '0';
  picker.style.border = '0';
  picker.style.background = 'transparent';
  picker.style.cursor = 'pointer';

  const syncPreview = (value) => {
    selectedColor = normalizeHexColor(value, selectedColor);
    previewSwatch.style.background = selectedColor;
    hexInput.value = selectedColor;
    picker.value = selectedColor;
  };

  hexInput.addEventListener('blur', () => {
    syncPreview(hexInput.value);
  });

  hexInput.addEventListener('keydown', async (event) => {
    if (event.key !== 'Enter') return;
    event.preventDefault();
    syncPreview(hexInput.value);

    try {
      await applyValue(selectedColor, selectedColor);
      pushRecentColor(recentStorageKey, selectedColor);
    } finally {
      close();
    }
  });

  const renderSwatchButton = (color, active = false) => {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.title = color;
    swatch.setAttribute('aria-label', color);
    swatch.style.width = '32px';
    swatch.style.height = '32px';
    swatch.style.borderRadius = '8px';
    swatch.style.border = active
      ? '2px solid #111827'
      : '1px solid rgba(15,23,42,.12)';
    swatch.style.background = color;
    swatch.style.cursor = 'pointer';

    swatch.addEventListener('click', async () => {
      syncPreview(color);

      try {
        await applyValue(color, color);
        pushRecentColor(recentStorageKey, color);
      } finally {
        close();
      }
    });

    return swatch;
  };

  palette.forEach((color) => {
    paletteWrap.appendChild(
      renderSwatchButton(color, normalizeHexColor(color) === selectedColor)
    );
  });

  const recentColors = readRecentColors(recentStorageKey);

  list.appendChild(previewRow);
  list.appendChild(paletteWrap);

  if (recentColors.length) {
    const recentSection = document.createElement('div');
    recentSection.style.display = 'flex';
    recentSection.style.flexDirection = 'column';
    recentSection.style.gap = '6px';

    const recentLabel = document.createElement('div');
    recentLabel.textContent = 'Recent';
    recentLabel.style.fontSize = '12px';
    recentLabel.style.fontWeight = '600';
    recentLabel.style.color = '#475569';

    const recentWrap = document.createElement('div');
    recentWrap.style.display = 'grid';
    recentWrap.style.gridTemplateColumns = `repeat(${columns}, 32px)`;
    recentWrap.style.gap = '6px';
    recentWrap.style.justifyContent = 'start';

    recentColors.forEach((color) => {
      recentWrap.appendChild(renderSwatchButton(color));
    });

    recentSection.appendChild(recentLabel);
    recentSection.appendChild(recentWrap);
    list.appendChild(recentSection);
  }

  if (allowAuto) {
    const autoBtn = document.createElement('button');
    autoBtn.type = 'button';
    autoBtn.textContent = autoLabel;
    autoBtn.style.padding = '7px 10px';
    autoBtn.style.borderRadius = '8px';
    autoBtn.style.border = '1px solid rgba(15,23,42,.12)';
    autoBtn.style.background = '#fff';
    autoBtn.style.cursor = 'pointer';

    autoBtn.addEventListener('click', async () => {
      try {
        await applyValue(autoValue, autoValue);
        pushRecentColor(recentStorageKey, autoValue);
      } finally {
        close();
      }
    });

    leftActions.appendChild(autoBtn);
  }

  picker.addEventListener('input', (event) => {
    syncPreview(event.target.value);
  });

  pickerLabel.appendChild(picker);

  const applyBtn = document.createElement('button');
  applyBtn.type = 'button';
  applyBtn.textContent = 'Apply';
  applyBtn.style.padding = '7px 12px';
  applyBtn.style.borderRadius = '8px';
  applyBtn.style.border = '1px solid #111827';
  applyBtn.style.background = '#111827';
  applyBtn.style.color = '#fff';
  applyBtn.style.cursor = 'pointer';

  applyBtn.addEventListener('click', async () => {
    syncPreview(hexInput.value);

    try {
      await applyValue(selectedColor, selectedColor);
      pushRecentColor(recentStorageKey, selectedColor);
    } finally {
      close();
    }
  });

  rightActions.appendChild(pickerLabel);
  rightActions.appendChild(applyBtn);

  footer.appendChild(leftActions);
  footer.appendChild(rightActions);

  list.appendChild(footer);
}