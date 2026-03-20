import { buttonTool } from '../core/toolkit.js';

export default buttonTool({
  id: 'keyboard-shortcuts',
  label: 'Shortcuts',
  icon: '⌨',
  title: 'Keyboard Shortcuts',
  async run(editor) {
    editor.modalHost.hidden = false;
    editor.modalHost.innerHTML = `
      <div class="mnb-modal-overlay">
        <div class="mnb-modal" style="width:min(760px,100%)">
          <div class="mnb-modal-head">
            <h3>Keyboard Shortcuts</h3>
            <button type="button" class="mnb-modal-close">×</button>
          </div>
          <div class="mnb-modal-body">
            <table style="width:100%;border-collapse:collapse">
              <thead>
                <tr><th>Action</th><th>Windows</th><th>Mac</th></tr>
              </thead>
              <tbody>
                <tr><td>Bold</td><td><span class="mnb-kbd">Ctrl</span> + <span class="mnb-kbd">B</span></td><td><span class="mnb-kbd">⌘</span> + <span class="mnb-kbd">B</span></td></tr>
                <tr><td>Italic</td><td><span class="mnb-kbd">Ctrl</span> + <span class="mnb-kbd">I</span></td><td><span class="mnb-kbd">⌘</span> + <span class="mnb-kbd">I</span></td></tr>
                <tr><td>Underline</td><td><span class="mnb-kbd">Ctrl</span> + <span class="mnb-kbd">U</span></td><td><span class="mnb-kbd">⌘</span> + <span class="mnb-kbd">U</span></td></tr>
                <tr><td>Undo</td><td><span class="mnb-kbd">Ctrl</span> + <span class="mnb-kbd">Z</span></td><td><span class="mnb-kbd">⌘</span> + <span class="mnb-kbd">Z</span></td></tr>
                <tr><td>Redo</td><td><span class="mnb-kbd">Ctrl</span> + <span class="mnb-kbd">Y</span></td><td><span class="mnb-kbd">⌘</span> + <span class="mnb-kbd">Shift</span> + <span class="mnb-kbd">Z</span></td></tr>
                <tr><td>Find</td><td><span class="mnb-kbd">Ctrl</span> + <span class="mnb-kbd">F</span></td><td><span class="mnb-kbd">⌘</span> + <span class="mnb-kbd">F</span></td></tr>
                <tr><td>Print</td><td><span class="mnb-kbd">Ctrl</span> + <span class="mnb-kbd">P</span></td><td><span class="mnb-kbd">⌘</span> + <span class="mnb-kbd">P</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    editor.modalHost.querySelectorAll('th,td').forEach((cell) => {
      cell.style.border = '1px solid #d9e2ef';
      cell.style.padding = '10px';
      cell.style.textAlign = 'left';
    });
    const close = () => {
      editor.modalHost.hidden = true;
      editor.modalHost.innerHTML = '';
    };
    editor.modalHost.querySelector('.mnb-modal-close').onclick = close;
    editor.modalHost.querySelector('.mnb-modal-overlay').onclick = (event) => {
      if (event.target.classList.contains('mnb-modal-overlay')) close();
    };
  },
});
