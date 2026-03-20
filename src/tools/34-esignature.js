import { buttonTool } from '../core/toolkit.js';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function pad(num) {
  return String(num).padStart(2, '0');
}

function signatureFont(size) {
  return `italic ${size}px "Brush Script MT", "Segoe Script", "Lucida Handwriting", "Snell Roundhand", cursive`;
}

function formatSignatureDate(date, format) {
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return '';

  const DD = pad(d.getDate());
  const MM = pad(d.getMonth() + 1);
  const YYYY = d.getFullYear();
  const YY = String(YYYY).slice(-2);

  const shortMonths = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const longMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

  const MMM = shortMonths[d.getMonth()];
  const MMMM = longMonths[d.getMonth()];

  switch (format) {
    case 'MM/DD/YYYY':
      return `${MM}/${DD}/${YYYY}`;
    case 'DD/MM/YYYY':
      return `${DD}/${MM}/${YYYY}`;
    case 'YYYY-MM-DD':
      return `${YYYY}-${MM}-${DD}`;
    case 'DD MMM YYYY':
      return `${DD} ${MMM} ${YYYY}`;
    case 'MMM DD, YYYY':
      return `${MMM} ${DD}, ${YYYY}`;
    case 'MMMM DD, YYYY':
      return `${MMMM} ${DD}, ${YYYY}`;
    case 'DD-MM-YYYY':
      return `${DD}-${MM}-${YYYY}`;
    case 'MM-DD-YYYY':
      return `${MM}-${DD}-${YYYY}`;
    case 'DD/MM/YY':
      return `${DD}/${MM}/${YY}`;
    case 'MM/DD/YY':
      return `${MM}/${DD}/${YY}`;
    default:
      return `${MM}/${DD}/${YYYY}`;
  }
}

function cropSignature(canvas, padding = 12) {
  const ctx = canvas.getContext('2d');
  const { width, height } = canvas;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  let top = null;
  let left = null;
  let right = null;
  let bottom = null;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const alpha = data[(y * width + x) * 4 + 3];
      if (alpha > 0) {
        if (top === null) top = y;
        if (left === null || x < left) left = x;
        if (right === null || x > right) right = x;
        if (bottom === null || y > bottom) bottom = y;
      }
    }
  }

  if (top === null) return null;

  left = Math.max(0, left - padding);
  top = Math.max(0, top - padding);
  right = Math.min(width - 1, right + padding);
  bottom = Math.min(height - 1, bottom + padding);

  const croppedWidth = right - left + 1;
  const croppedHeight = bottom - top + 1;

  const output = document.createElement('canvas');
  output.width = croppedWidth;
  output.height = croppedHeight;

  const outCtx = output.getContext('2d');
  outCtx.drawImage(
    canvas,
    left,
    top,
    croppedWidth,
    croppedHeight,
    0,
    0,
    croppedWidth,
    croppedHeight
  );

  return {
    dataUrl: output.toDataURL('image/png'),
    width: croppedWidth,
    height: croppedHeight,
  };
}

function createTypedSignatureDataUrl(text, color = '#6b7280') {
  const value = String(text || '').trim();
  if (!value) return null;

  const fontSize = 46;
  const paddingX = 18;
  const paddingY = 16;

  const measureCanvas = document.createElement('canvas');
  const measureCtx = measureCanvas.getContext('2d');
  measureCtx.font = signatureFont(fontSize);

  const metrics = measureCtx.measureText(value);
  const width = Math.ceil(metrics.width + paddingX * 2);
  const height = Math.ceil(fontSize + paddingY * 2);

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);
  ctx.font = signatureFont(fontSize);
  ctx.fillStyle = color;
  ctx.textBaseline = 'middle';
  ctx.fillText(value, paddingX, height / 2);

  return {
    dataUrl: canvas.toDataURL('image/png'),
    width,
    height,
  };
}

function buildSignatureBoxHtml({
  contentHtml,
  showDate,
  dateText = '',
  width = '100%',
  minSignatureHeight = '76px',
  borderColor = '#6b7280',
  background = '#ffffff',
}) {
  const topBadgeHtml = `
    <span
      style="
        position:absolute;
        top:0;
        left:12px;
        transform:translateY(-50%);
        display:inline-block;
        padding:0 6px;
        background:${background};
        font-size:10px;
        line-height:1;
        font-weight:700;
        letter-spacing:0.08em;
        text-transform:uppercase;
        color:#6b7280;
        white-space:nowrap;
      "
    >
      Digitally signed
    </span>
  `;

  const bottomDateHtml = showDate
    ? `
      <span
        style="
          position:absolute;
          left:50%;
          bottom:0;
          transform:translate(-50%, 50%);
          display:inline-block;
          padding:0 8px;
          background:${background};
          font-size:12px;
          line-height:1;
          font-weight:700;
          color:#2563eb;
          white-space:nowrap;
        "
      >
        ${dateText}
      </span>
    `
    : '';

  return `
    <span
      style="
        position:relative;
        display:inline-flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        width:${width};
        max-width:100%;
        border:1px solid ${borderColor};
        background:${background};
        padding:18px 14px 16px;
        box-sizing:border-box;
      "
    >
      ${topBadgeHtml}
      ${bottomDateHtml}

      <span
        style="
          display:flex;
          align-items:center;
          justify-content:center;
          width:100%;
          min-height:${minSignatureHeight};
          background:transparent;
        "
      >
        ${contentHtml}
      </span>
    </span>
  `;
}

function openSignaturePad({ defaultColor = '#6b7280' } = {}) {
  return new Promise((resolve) => {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.45);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
      padding: 16px;
      backdrop-filter: blur(2px);
    `;

    const modal = document.createElement('div');
    modal.style.cssText = `
      background: #ffffff;
      width: min(900px, 100%);
      max-height: calc(100vh - 32px);
      border-radius: 18px;
      box-shadow: 0 25px 80px rgba(0,0,0,0.20);
      overflow: hidden;
      font-family: system-ui, sans-serif;
      border: 1px solid #e5e7eb;
      display: flex;
      flex-direction: column;
    `;

    modal.innerHTML = `
      <div style="padding:16px 20px;border-bottom:1px solid #e5e7eb;background:#fafafa;flex:0 0 auto;">
        <div style="font-size:18px;font-weight:700;color:#111827;">Add Signature</div>
        <div style="font-size:13px;color:#6b7280;margin-top:4px;">
          Choose typed or drawn. Signature output uses a full bordered sign box.
        </div>
      </div>

      <div style="padding:16px 20px;overflow:auto;flex:1 1 auto;">
        <div
          style="
            display:flex;
            flex-wrap:wrap;
            gap:12px;
            align-items:flex-end;
            margin-bottom:12px;
          "
        >
          <div
            style="
              display:flex;
              flex-direction:column;
              gap:7px;
              min-width:260px;
              flex:1 1 300px;
            "
          >
            <div style="font-size:13px;font-weight:600;color:#374151;">Signature source</div>
            <div
              id="sig-source-group"
              style="
                display:flex;
                align-items:center;
                gap:6px;
                padding:4px;
                border:1px solid #d1d5db;
                border-radius:14px;
                background:#f9fafb;
                min-height:42px;
                width:100%;
                box-sizing:border-box;
              "
            >
              <label
                style="
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  gap:6px;
                  padding:8px 12px;
                  min-height:34px;
                  border-radius:10px;
                  cursor:pointer;
                  font-size:13px;
                  font-weight:600;
                  color:#374151;
                  flex:1 1 0;
                  white-space:nowrap;
                "
              >
                <input type="radio" name="sig-source" value="typed" checked />
                Use typed
              </label>

              <label
                style="
                  display:flex;
                  align-items:center;
                  justify-content:center;
                  gap:6px;
                  padding:8px 12px;
                  min-height:34px;
                  border-radius:10px;
                  cursor:pointer;
                  font-size:13px;
                  font-weight:600;
                  color:#374151;
                  flex:1 1 0;
                  white-space:nowrap;
                "
              >
                <input type="radio" name="sig-source" value="drawn" />
                Use drawn
              </label>
            </div>
          </div>

          <label
            style="
              display:flex;
              flex-direction:column;
              gap:7px;
              min-width:110px;
              flex:0 0 110px;
              font-size:13px;
              font-weight:600;
              color:#374151;
            "
          >
            Ink color
            <input
              id="sig-color"
              type="color"
              value="${defaultColor}"
              style="
                height:42px;
                border:1px solid #d1d5db;
                border-radius:12px;
                padding:4px;
                background:#fff;
                width:100%;
                box-sizing:border-box;
              "
            />
          </label>

          <label
            id="sig-stroke-wrap"
            style="
              display:flex;
              flex-direction:column;
              gap:7px;
              min-width:150px;
              flex:1 1 170px;
              font-size:13px;
              font-weight:600;
              color:#374151;
            "
          >
            Stroke
            <div
              style="
                height:42px;
                display:flex;
                align-items:center;
                padding:0 2px;
                box-sizing:border-box;
              "
            >
              <input id="sig-size" type="range" min="1" max="6" value="2" style="width:100%;" />
            </div>
          </label>

          <div
            style="
              display:flex;
              flex-direction:column;
              gap:7px;
              min-width:130px;
              flex:0 0 130px;
            "
          >
            <div style="font-size:13px;font-weight:600;color:#374151;">Show date</div>
            <label
              style="
                display:inline-flex;
                align-items:center;
                gap:10px;
                cursor:pointer;
                user-select:none;
                height:42px;
              "
            >
              <input
                id="sig-show-date"
                type="checkbox"
                checked
                style="position:absolute;opacity:0;pointer-events:none;width:1px;height:1px;"
              />
              <span
                id="sig-show-date-track"
                style="
                  position:relative;
                  display:inline-block;
                  width:44px;
                  height:24px;
                  border-radius:999px;
                  background:#111827;
                  transition:all 140ms ease;
                  box-shadow: inset 0 0 0 1px rgba(0,0,0,0.05);
                  flex:0 0 auto;
                "
              >
                <span
                  id="sig-show-date-thumb"
                  style="
                    position:absolute;
                    top:2px;
                    left:22px;
                    width:20px;
                    height:20px;
                    border-radius:50%;
                    background:#ffffff;
                    box-shadow:0 1px 2px rgba(0,0,0,0.18);
                    transition:all 140ms ease;
                  "
                ></span>
              </span>
              <span
                id="sig-show-date-label"
                style="
                  font-size:13px;
                  font-weight:600;
                  color:#111827;
                  white-space:nowrap;
                "
              >
                On
              </span>
            </label>
          </div>
        </div>

        <div style="margin-bottom:14px;max-width:240px;">
          <label style="font-size:13px;font-weight:600;color:#374151;display:flex;flex-direction:column;gap:7px;">
            Date format
            <select
              id="sig-date-format"
              style="
                padding:11px 12px;
                border:1px solid #d1d5db;
                border-radius:12px;
                font:inherit;
                background:#fff;
                color:#374151;
                outline:none;
              "
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              <option value="DD MMM YYYY">DD MMM YYYY</option>
              <option value="MMM DD, YYYY">MMM DD, YYYY</option>
              <option value="MMMM DD, YYYY">MMMM DD, YYYY</option>
              <option value="DD-MM-YYYY">DD-MM-YYYY</option>
              <option value="MM-DD-YYYY">MM-DD-YYYY</option>
              <option value="DD/MM/YY">DD/MM/YY</option>
              <option value="MM/DD/YY">MM/DD/YY</option>
            </select>
          </label>
        </div>

        <div id="sig-typed-section" style="display:block;">
          <div style="display:flex;flex-direction:column;gap:12px;">
            <label style="font-size:13px;font-weight:600;color:#374151;display:flex;flex-direction:column;gap:7px;">
              Typed signature
              <input
                id="sig-typed"
                type="text"
                value=""
                placeholder="Type signature text"
                style="
                  padding:11px 12px;
                  border:1px solid #d1d5db;
                  border-radius:12px;
                  font:inherit;
                  font-style:italic;
                  color:#374151;
                  outline:none;
                "
              />
            </label>

            <div>
              <div style="margin-bottom:8px;font-size:13px;color:#6b7280;">Preview</div>
              <div
                style="
                  border:1px solid #e5e7eb;
                  border-radius:16px;
                  background:linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
                  padding:20px 18px 18px;
                  min-height:150px;
                  display:flex;
                  align-items:center;
                  justify-content:center;
                "
              >
                <div
                  id="sig-typed-preview"
                  style="
                    width:min(360px, 100%);
                    display:flex;
                    flex-direction:column;
                    align-items:center;
                    justify-content:center;
                    opacity:0.55;
                    transition:opacity 120ms ease;
                  "
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div id="sig-drawn-section" style="display:none;">
          <div style="margin-bottom:8px;font-size:13px;color:#6b7280;">
            Draw signature
          </div>

          <div
            id="sig-wrap"
            style="
              border:1px solid #d1d5db;
              border-radius:16px;
              overflow:hidden;
              background:
                linear-gradient(to bottom, transparent 95%, #f3f4f6 95%) 0 0 / 100% 28px,
                #ffffff;
              box-shadow: inset 0 1px 0 rgba(255,255,255,0.5);
            "
          >
            <canvas
              id="sig-canvas"
              style="
                display:block;
                width:100%;
                height:170px;
                touch-action:none;
                cursor:crosshair;
              "
            ></canvas>
          </div>
        </div>
      </div>

      <div style="display:flex;justify-content:space-between;gap:12px;padding:14px 20px;border-top:1px solid #e5e7eb;background:#fafafa;flex:0 0 auto;">
        <button
          data-action="clear"
          style="
            padding:10px 14px;
            border-radius:12px;
            border:1px solid #d1d5db;
            background:#fff;
            cursor:pointer;
            color:#374151;
            font:inherit;
          "
        >
          Clear
        </button>

        <div style="display:flex;gap:10px;">
          <button
            data-action="cancel"
            style="
              padding:10px 14px;
              border-radius:12px;
              border:1px solid #d1d5db;
              background:#fff;
              cursor:pointer;
              color:#374151;
              font:inherit;
            "
          >
            Cancel
          </button>
          <button
            data-action="save"
            style="
              padding:10px 16px;
              border-radius:12px;
              border:0;
              background:#111827;
              color:#fff;
              cursor:pointer;
              font:inherit;
              font-weight:600;
            "
          >
            Insert Signature
          </button>
        </div>
      </div>
    `;

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const canvas = modal.querySelector('#sig-canvas');
    const wrap = modal.querySelector('#sig-wrap');
    const ctx = canvas.getContext('2d');

    const typedInput = modal.querySelector('#sig-typed');
    const colorInput = modal.querySelector('#sig-color');
    const sizeInput = modal.querySelector('#sig-size');
    const showDateInput = modal.querySelector('#sig-show-date');
    const showDateTrack = modal.querySelector('#sig-show-date-track');
    const showDateThumb = modal.querySelector('#sig-show-date-thumb');
    const showDateLabel = modal.querySelector('#sig-show-date-label');
    const dateFormatInput = modal.querySelector('#sig-date-format');
    const typedPreview = modal.querySelector('#sig-typed-preview');
    const typedSection = modal.querySelector('#sig-typed-section');
    const drawnSection = modal.querySelector('#sig-drawn-section');
    const strokeWrap = modal.querySelector('#sig-stroke-wrap');
    const sourceInputs = Array.from(modal.querySelectorAll('input[name="sig-source"]'));

    const clearBtn = modal.querySelector('[data-action="clear"]');
    const cancelBtn = modal.querySelector('[data-action="cancel"]');
    const saveBtn = modal.querySelector('[data-action="save"]');

    let drawing = false;
    let hasDrawn = false;
    let lastX = 0;
    let lastY = 0;

    function getSelectedSource() {
      return sourceInputs.find((input) => input.checked)?.value || 'typed';
    }

    function setupContext() {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    function resizeCanvas() {
      const ratio = window.devicePixelRatio || 1;
      const rect = wrap.getBoundingClientRect();
      const snapshot = canvas.width && canvas.height ? canvas.toDataURL('image/png') : null;

      canvas.width = rect.width * ratio;
      canvas.height = 170 * ratio;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(ratio, ratio);
      setupContext();

      if (snapshot) {
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0, rect.width, 170);
        };
        img.src = snapshot;
      }
    }

    function getPoint(event) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top,
      };
    }

    function startDraw(event) {
      event.preventDefault();
      drawing = true;
      hasDrawn = true;

      if (typeof canvas.setPointerCapture === 'function' && event.pointerId != null) {
        canvas.setPointerCapture(event.pointerId);
      }

      const point = getPoint(event);
      lastX = point.x;
      lastY = point.y;
    }

    function draw(event) {
      if (!drawing) return;
      event.preventDefault();

      const point = getPoint(event);
      ctx.strokeStyle = colorInput.value;
      ctx.lineWidth = Number(sizeInput.value);

      ctx.beginPath();
      ctx.moveTo(lastX, lastY);
      ctx.lineTo(point.x, point.y);
      ctx.stroke();

      lastX = point.x;
      lastY = point.y;
    }

    function endDraw(event) {
      if (event && typeof canvas.releasePointerCapture === 'function' && event.pointerId != null) {
        try {
          canvas.releasePointerCapture(event.pointerId);
        } catch (_) {
          // ignore
        }
      }
      drawing = false;
    }

    function clearCanvas() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      hasDrawn = false;
    }

    function renderTypedPreview() {
      const typedValue = typedInput.value.trim();
      const showDate = showDateInput.checked;
      const dateText = showDate ? formatSignatureDate(new Date(), dateFormatInput.value) : '';

      if (!typedValue) {
        typedPreview.style.opacity = '0.55';
        typedPreview.innerHTML = `
          <div style="text-align:center;color:#9ca3af;">
            <div style="font-size:15px;font-weight:600;margin-bottom:8px;">Typed signature preview</div>
            <div style="font-size:13px;">Type a signature above to preview it here</div>
          </div>
        `;
        return;
      }

      typedPreview.style.opacity = '1';
      typedPreview.innerHTML = buildSignatureBoxHtml({
        contentHtml: `
          <span
            style="
              display:inline-block;
              font:${signatureFont(38)};
              color:${escapeHtml(colorInput.value)};
              line-height:1;
              white-space:nowrap;
              max-width:100%;
              overflow:hidden;
              text-overflow:ellipsis;
            "
          >
            ${escapeHtml(typedValue)}
          </span>
        `,
        showDate,
        dateText: escapeHtml(dateText),
        width: '100%',
        minSignatureHeight: '25px',
        borderColor: '#6b7280',
        background: '#ffffff',
      });
    }

    function renderSourceMode() {
      const mode = getSelectedSource();
      const typedActive = mode === 'typed';

      typedSection.style.display = typedActive ? 'block' : 'none';
      drawnSection.style.display = typedActive ? 'none' : 'block';
      strokeWrap.style.opacity = typedActive ? '0.55' : '1';
      sizeInput.disabled = typedActive;
      clearBtn.textContent = typedActive ? 'Clear text' : 'Clear pad';

      sourceInputs.forEach((input) => {
        const label = input.closest('label');
        if (!label) return;
        label.style.background = input.checked ? '#ffffff' : 'transparent';
        label.style.boxShadow = input.checked ? '0 1px 2px rgba(0,0,0,0.06)' : 'none';
        label.style.color = input.checked ? '#111827' : '#374151';
      });

      if (!typedActive) {
        setTimeout(() => resizeCanvas(), 0);
      }
    }

    function renderShowDateToggle() {
      const checked = showDateInput.checked;

      showDateTrack.style.background = checked ? '#111827' : '#d1d5db';
      showDateThumb.style.left = checked ? '22px' : '2px';
      showDateLabel.textContent = checked ? 'On' : 'Off';
      showDateLabel.style.color = checked ? '#111827' : '#6b7280';

      dateFormatInput.disabled = !checked;
      dateFormatInput.style.opacity = checked ? '1' : '0.55';
    }

    function cleanup(result = null) {
      window.removeEventListener('resize', resizeCanvas);
      overlay.remove();
      resolve(result);
    }

    showDateInput.addEventListener('change', () => {
      renderShowDateToggle();
      renderTypedPreview();
    });

    typedInput.addEventListener('input', renderTypedPreview);
    colorInput.addEventListener('input', renderTypedPreview);
    dateFormatInput.addEventListener('change', renderTypedPreview);
    sourceInputs.forEach((input) => input.addEventListener('change', renderSourceMode));

    resizeCanvas();
    renderTypedPreview();
    renderSourceMode();
    renderShowDateToggle();

    window.addEventListener('resize', resizeCanvas);

    canvas.addEventListener('pointerdown', startDraw);
    canvas.addEventListener('pointermove', draw);
    canvas.addEventListener('pointerup', endDraw);
    canvas.addEventListener('pointerleave', endDraw);
    canvas.addEventListener('pointercancel', endDraw);

    clearBtn.addEventListener('click', () => {
      if (getSelectedSource() === 'typed') {
        typedInput.value = '';
        renderTypedPreview();
        return;
      }
      clearCanvas();
    });

    cancelBtn.addEventListener('click', () => cleanup(null));

    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) cleanup(null);
    });

    saveBtn.addEventListener('click', () => {
      const mode = getSelectedSource();

      if (mode === 'typed') {
        const typedValue = typedInput.value.trim();
        const typedSignature = typedValue ? createTypedSignatureDataUrl(typedValue, colorInput.value) : null;

        if (!typedSignature) {
          alert('Please type a signature first.');
          return;
        }

        cleanup({
          dataUrl: typedSignature.dataUrl,
          width: typedSignature.width,
          showDate: showDateInput.checked,
          dateFormat: dateFormatInput.value,
        });
        return;
      }

      const drawnValue = hasDrawn ? cropSignature(canvas, 10) : null;
      if (!drawnValue) {
        alert('Please draw a signature first.');
        return;
      }

      cleanup({
        dataUrl: drawnValue.dataUrl,
        width: drawnValue.width,
        showDate: showDateInput.checked,
        dateFormat: dateFormatInput.value,
      });
    });
  });
}

export default buttonTool({
  id: 'esignature',
  label: 'E-Sign',
  icon: '✍',
  title: 'E-Signature',
  async run(editor) {
    const result = await openSignaturePad({ defaultColor: '#7c7c7c' });
    if (!result) return;

    const dateText = result.showDate
      ? escapeHtml(formatSignatureDate(new Date(), result.dateFormat))
      : '';

    const visualWidth = Math.max(
      230,
      Math.min(340, Math.round((result.width || 260) / (window.devicePixelRatio || 1)) + 28)
    );

    const signatureMarkup = `
      <img
        src="${result.dataUrl}"
        alt="Signature"
        style="
          display:block;
          max-width:100%;
          max-height:78px;
          width:auto;
          height:auto;
          object-fit:contain;
          background:transparent;
        "
      />
    `;

    editor.insertHTML(`
      <span
        contenteditable="false"
        style="
          display:inline-flex;
          vertical-align:middle;
          margin:0;
          padding:12px 0;
          background:transparent;
          border:none;
          box-shadow:none;
        "
      >
        ${buildSignatureBoxHtml({
      contentHtml: signatureMarkup,
      showDate: result.showDate,
      dateText,
      width: `${visualWidth}px`,
      minSignatureHeight: '70px',
      borderColor: '#6b7280',
      background: '#ffffff',
    })}
      </span>
    `);

    editor.alert('Signature inserted.', 'success');
  },
});