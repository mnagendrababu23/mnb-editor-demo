import { buttonTool } from '../core/toolkit.js';

function findAnimatedAncestor(node, root) {
  let current = node && node.nodeType === Node.TEXT_NODE ? node.parentNode : node;

  while (current && current !== root) {
    if (current.nodeType === Node.ELEMENT_NODE && current.hasAttribute('data-text-animation')) {
      return current;
    }
    current = current.parentNode;
  }

  return null;
}

function unwrapElement(element) {
  if (!element || !element.parentNode) return;
  const parent = element.parentNode;

  while (element.firstChild) {
    parent.insertBefore(element.firstChild, element);
  }

  parent.removeChild(element);
}

export default buttonTool({
  id: 'text-animation',
  label: 'Animation',
  icon: '✨',
  title: 'Text Animation',
  iconOnlyMenu: true,
  persistValue: false,
  options: [
    { label: 'Pulse', value: 'pulse' },
    { label: 'Float', value: 'float' },
    { label: 'Glow', value: 'glow' },
    { label: 'None', value: 'none' },
  ],

  run(editor, value) {
    const range = editor.selectedRange();
    if (!range) {
      editor.alert('Select text first.', 'error');
      return;
    }

    const selectedText = editor.getSelectedText().trim();

    if (value === 'none') {
      const anchorNode = range.commonAncestorContainer;
      const animated = findAnimatedAncestor(anchorNode, editor.surface);

      if (!animated) {
        editor.alert('No animated text found here.', 'info');
        return;
      }

      unwrapElement(animated);
      editor.saveHistory('text-animation-none');
      editor.refreshStatus();
      editor.captureSelection();
      editor.alert('Text animation removed.', 'success');
      return;
    }

    if (!selectedText) {
      editor.alert('Select the word or text you want to animate.', 'error');
      return;
    }

    editor.surroundSelection('span', {
      attrs: {
        'data-text-animation': value,
      },
    });

    editor.saveHistory(`text-animation-${value}`);
    editor.refreshStatus();
    editor.alert(`Text animation set to ${value}.`, 'success');
  },
});