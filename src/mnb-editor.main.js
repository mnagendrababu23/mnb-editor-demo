import { createEditor } from './core/editor-core.js';

import tool_01_undo from './tools/01-undo.js';
import tool_02_redo from './tools/02-redo.js';
import tool_03_logs from './tools/03-logs.js';
import tool_04_block_styles from './tools/04-block-styles.js';
import tool_05_font_sizes from './tools/05-font-sizes.js';
import tool_06_font_family from './tools/06-font-family.js';
import tool_07_bold from './tools/07-bold.js';
import tool_08_italic from './tools/08-italic.js';
import tool_09_underline from './tools/09-underline.js';
import tool_10_strikethrough from './tools/10-strikethrough.js';
import tool_11_font_color from './tools/11-font-color.js';
import tool_12_text_highlight from './tools/12-text-highlight.js';
import tool_13_list from './tools/13-list.js';
import tool_14_sub_list from './tools/14-sub-list.js';
import tool_15_decrease_indent from './tools/15-decrease-indent.js';
import tool_16_increase_indent from './tools/16-increase-indent.js';
import tool_17_sort from './tools/17-sort.js';
import tool_18_show_hide from './tools/18-show-hide.js';
import tool_19_align_left from './tools/19-align-left.js';
import tool_20_align_center from './tools/20-align-center.js';
import tool_21_align_right from './tools/21-align-right.js';
import tool_22_justify from './tools/22-justify.js';
import tool_23_vertical_alignment from './tools/23-vertical-alignment.js';
import tool_24_horizontal_alignment from './tools/24-horizontal-alignment.js';
import tool_25_line_height from './tools/25-line-height.js';
import tool_26_font_spacing from './tools/26-font-spacing.js';
import tool_27_space_before from './tools/27-space-before.js';
import tool_28_space_after from './tools/28-space-after.js';
import tool_29_table from './tools/29-table.js';
import tool_30_view_grid_lines from './tools/30-view-grid-lines.js';
import tool_31_horizontal_line from './tools/31-horizontal-line.js';
import tool_32_find_replace from './tools/32-find-replace.js';
import tool_33_insert_shapes from './tools/33-insert-shapes.js';
import tool_34_esignature from './tools/34-esignature.js';
import tool_35_image from './tools/35-image.js';
import tool_36_video from './tools/36-video.js';
import tool_37_other_files from './tools/37-other-files.js';
import tool_38_word_art from './tools/38-word-art.js';
import tool_39_date_formats from './tools/39-date-formats.js';
import tool_40_embed from './tools/40-embed.js';
import tool_41_comments from './tools/41-comments.js';
import tool_42_margins_padding from './tools/42-margins-padding.js';
import tool_43_word_count from './tools/43-word-count.js';
import tool_44_link from './tools/44-link.js';
import tool_45_remove_format from './tools/45-remove-format.js';
import tool_46_emoji from './tools/46-emoji.js';
import tool_47_charmap from './tools/47-charmap.js';
import tool_48_preview from './tools/48-preview.js';
import tool_49_view_code from './tools/49-view-code.js';
import tool_50_full_screen from './tools/50-full-screen.js';
import tool_51_elements from './tools/51-elements.js';
import tool_52_layout from './tools/52-layout.js';
import tool_53_gallery from './tools/53-gallery.js';
import tool_54_theme from './tools/54-theme.js';
import tool_55_blockquote from './tools/55-blockquote.js';
import tool_56_keyboard_shortcuts from './tools/56-keyboard-shortcuts.js';
import tool_57_error_messages from './tools/57-error-messages.js';
import tool_58_show_alerts from './tools/58-show-alerts.js';
import tool_59_text_animation from './tools/59-text-animation.js';
import tool_60_background_linear_gradient from './tools/60-background-linear-gradient.js';
import tool_61_currency_symbols from './tools/61-currency-symbols.js';
import tool_62_unicode_symbols from './tools/62-unicode-symbols.js';
import tool_63_code_sprint from './tools/63-code-sprint.js';
import tool_64_export from './tools/64-export.js';
import tool_65_languages from './tools/65-languages.js';
import tool_66_print from './tools/66-print.js';
import tool_67_ai_integration from './tools/67-ai-integration.js';

const RAW_TOOLS = [
  tool_01_undo,
  tool_02_redo,
  tool_03_logs,
  tool_04_block_styles,
  tool_05_font_sizes,
  tool_06_font_family,
  tool_07_bold,
  tool_08_italic,
  tool_09_underline,
  tool_10_strikethrough,
  tool_11_font_color,
  tool_12_text_highlight,
  tool_13_list,
  tool_14_sub_list,
  tool_15_decrease_indent,
  tool_16_increase_indent,
  tool_17_sort,
  tool_18_show_hide,
  tool_19_align_left,
  tool_20_align_center,
  tool_21_align_right,
  tool_22_justify,
  tool_23_vertical_alignment,
  tool_24_horizontal_alignment,
  tool_25_line_height,
  tool_26_font_spacing,
  tool_27_space_before,
  tool_28_space_after,
  tool_29_table,
  tool_30_view_grid_lines,
  tool_31_horizontal_line,
  tool_32_find_replace,
  tool_33_insert_shapes,
  tool_34_esignature,
  tool_35_image,
  tool_36_video,
  tool_37_other_files,
  tool_38_word_art,
  tool_39_date_formats,
  tool_40_embed,
  tool_41_comments,
  tool_42_margins_padding,
  tool_43_word_count,
  tool_44_link,
  tool_45_remove_format,
  tool_46_emoji,
  tool_47_charmap,
  tool_48_preview,
  tool_49_view_code,
  tool_50_full_screen,
  tool_51_elements,
  tool_52_layout,
  tool_53_gallery,
  tool_54_theme,
  tool_55_blockquote,
  tool_56_keyboard_shortcuts,
  tool_57_error_messages,
  tool_58_show_alerts,
  tool_59_text_animation,
  tool_60_background_linear_gradient,
  tool_61_currency_symbols,
  tool_62_unicode_symbols,
  tool_63_code_sprint,
  tool_64_export,
  tool_65_languages,
  tool_66_print,
  tool_67_ai_integration,
];

const TOOL_META = {
  'undo': {
    group: 'row-1-group-1',
    groupLabel: 'History',
    area: 'top',
    icon: '↶',
    toolbarLabel: 'Undo',
  },
  'redo': {
    group: 'row-1-group-1',
    groupLabel: 'History',
    area: 'top',
    icon: '↷',
    toolbarLabel: 'Redo',
  },
  'logs': {
    group: 'row-1-group-1',
    groupLabel: 'History',
    area: 'top',
    icon: '📝',
    toolbarLabel: 'Logs',
  },

  'block-styles': {
    group: 'row-1-group-2',
    groupLabel: 'Text Controls',
    area: 'top',
    icon: '¶',
    toolbarLabel: 'Paragraph',
    toolbarVariant: 'docs-select',
  },
  'font-family': {
    group: 'row-1-group-2',
    groupLabel: 'Text Controls',
    area: 'top',
    icon: '𝓕',
    toolbarLabel: 'Inter',
    toolbarVariant: 'docs-select',
  },

  'font-sizes': {
    group: 'row-1-group-3',
    groupLabel: 'Typography',
    area: 'top',
    icon: 'A',
    toolbarLabel: '16px',
    toolbarVariant: 'docs-select',
  },
  'line-height': {
    group: 'row-1-group-3',
    groupLabel: 'Typography',
    area: 'top',
    icon: '⇕',
    toolbarLabel: '1.6',
    toolbarVariant: 'docs-select',
  },
  'font-spacing': {
    group: 'row-1-group-3',
    groupLabel: 'Typography',
    area: 'top',
    icon: '⟷',
    toolbarLabel: 'Spacing',
  },
  'space-before': {
    group: 'row-1-group-3',
    groupLabel: 'Typography',
    area: 'top',
    icon: '⤒',
    toolbarLabel: 'Space before',
  },
  'space-after': {
    group: 'row-1-group-3',
    groupLabel: 'Typography',
    area: 'top',
    icon: '⤓',
    toolbarLabel: 'Space after',
  },

  'word-art': {
    group: 'row-1-group-4',
    groupLabel: 'Creative',
    area: 'top',
    icon: '𝓦',
    toolbarLabel: 'Word art',
  },
  'esignature': {
    group: 'row-1-group-4',
    groupLabel: 'Creative',
    area: 'top',
    icon: '✍',
    toolbarLabel: 'E-signature',
  },
  'text-animation': {
    group: 'row-1-group-4',
    groupLabel: 'Creative',
    area: 'top',
    icon: '✨',
    toolbarLabel: 'Text animation',
  },
  'date-formats': {
    group: 'row-1-group-4',
    groupLabel: 'Creative',
    area: 'top',
    icon: '📅',
    toolbarLabel: 'Dates',
  },

  'emoji': {
    group: 'row-1-group-5',
    groupLabel: 'Symbols & Shapes',
    area: 'top',
    icon: '😊',
    toolbarLabel: 'Emoji',
  },
  'charmap': {
    group: 'row-1-group-5',
    groupLabel: 'Symbols & Shapes',
    area: 'top',
    icon: 'Ω',
    toolbarLabel: 'Symbols',
  },
  'insert-shapes': {
    group: 'row-1-group-5',
    groupLabel: 'Symbols & Shapes',
    area: 'top',
    icon: '⬠',
    toolbarLabel: 'Shapes',
  },

  'bold': {
    group: 'row-2-group-1',
    groupLabel: 'Formatting',
    area: 'top',
    icon: 'B',
    toolbarLabel: 'Bold',
  },
  'italic': {
    group: 'row-2-group-1',
    groupLabel: 'Formatting',
    area: 'top',
    icon: 'I',
    toolbarLabel: 'Italic',
  },
  'underline': {
    group: 'row-2-group-1',
    groupLabel: 'Formatting',
    area: 'top',
    icon: 'U',
    toolbarLabel: 'Underline',
  },
  'strikethrough': {
    group: 'row-2-group-1',
    groupLabel: 'Formatting',
    area: 'top',
    icon: 'S',
    toolbarLabel: 'Strikethrough',
  },
  'font-color': {
    group: 'row-2-group-1',
    groupLabel: 'Formatting',
    area: 'top',
    icon: 'A',
    toolbarLabel: 'Color',
  },
  'text-highlight': {
    group: 'row-2-group-1',
    groupLabel: 'Formatting',
    area: 'top',
    icon: '🖍',
    toolbarLabel: 'Highlight',
  },
  'remove-format': {
    group: 'row-2-group-1',
    groupLabel: 'Formatting',
    area: 'top',
    icon: '⌫',
    toolbarLabel: 'Clear format',
  },

  'list': {
    group: 'row-2-group-2',
    groupLabel: 'Paragraph',
    area: 'top',
    icon: '•',
    toolbarLabel: 'List',
  },
  'sub-list': {
    group: 'row-2-group-2',
    groupLabel: 'Paragraph',
    area: 'top',
    icon: '↳',
    toolbarLabel: 'Sub list',
  },
  'align-left': {
    group: 'row-2-group-2',
    groupLabel: 'Paragraph',
    area: 'top',
    icon: '≡',
    toolbarLabel: 'Align left',
  },
  'align-center': {
    group: 'row-2-group-2',
    groupLabel: 'Paragraph',
    area: 'top',
    icon: '≣',
    toolbarLabel: 'Align center',
  },
  'align-right': {
    group: 'row-2-group-2',
    groupLabel: 'Paragraph',
    area: 'top',
    icon: '☰',
    toolbarLabel: 'Align right',
  },
  'justify': {
    group: 'row-2-group-2',
    groupLabel: 'Paragraph',
    area: 'top',
    icon: '☷',
    toolbarLabel: 'Justify',
  },
  'decrease-indent': {
    group: 'row-2-group-2',
    groupLabel: 'Paragraph',
    area: 'top',
    icon: '⇤',
    toolbarLabel: 'Decrease indent',
  },
  'increase-indent': {
    group: 'row-2-group-2',
    groupLabel: 'Paragraph',
    area: 'top',
    icon: '⇥',
    toolbarLabel: 'Increase indent',
  },
  'sort': {
    group: 'row-2-group-2',
    groupLabel: 'Paragraph',
    area: 'top',
    icon: '⇅',
    toolbarLabel: 'Sort',
  },
  'show-hide': {
    group: 'row-2-group-2',
    groupLabel: 'Paragraph',
    area: 'top',
    icon: '👁',
    toolbarLabel: 'Show hide',
  },

  'table': {
    group: 'row-2-group-3',
    groupLabel: 'Insert',
    area: 'top',
    icon: '▦',
    toolbarLabel: 'Table',
  },
  'image': {
    group: 'row-2-group-3',
    groupLabel: 'Insert',
    area: 'top',
    icon: '🖼',
    toolbarLabel: 'Image',
  },
  'video': {
    group: 'row-2-group-3',
    groupLabel: 'Insert',
    area: 'top',
    icon: '🎬',
    toolbarLabel: 'Video',
  },
  'other-files': {
    group: 'row-2-group-3',
    groupLabel: 'Insert',
    area: 'top',
    icon: '📎',
    toolbarLabel: 'Files',
  },
  'link': {
    group: 'row-2-group-3',
    groupLabel: 'Insert',
    area: 'top',
    icon: '🔗',
    toolbarLabel: 'Link',
  },
  'horizontal-line': {
    group: 'row-2-group-3',
    groupLabel: 'Insert',
    area: 'top',
    icon: '—',
    toolbarLabel: 'HR',
  },

  'margins-padding': {
    group: 'row-3-group-1',
    groupLabel: 'Layout',
    area: 'top',
    icon: '⬚',
    toolbarLabel: 'Margins padding',
  },
  'elements': {
    group: 'row-3-group-1',
    groupLabel: 'Layout',
    area: 'top',
    icon: '▣',
    toolbarLabel: 'Elements',
  },
  'layout': {
    group: 'row-3-group-1',
    groupLabel: 'Layout',
    area: 'top',
    icon: '▥',
    toolbarLabel: 'Layout',
  },
  'gallery': {
    group: 'row-3-group-1',
    groupLabel: 'Layout',
    area: 'top',
    icon: '🗂',
    toolbarLabel: 'Gallery',
  },
  'theme': {
    group: 'row-3-group-1',
    groupLabel: 'Layout',
    area: 'top',
    icon: '◐',
    toolbarLabel: 'Theme',
  },

  'find-replace': {
    group: 'row-3-group-2',
    groupLabel: 'Review',
    area: 'top',
    icon: '🔎',
    toolbarLabel: 'Search replace',
  },
  'comments': {
    group: 'row-3-group-2',
    groupLabel: 'Review',
    area: 'top',
    icon: '💬',
    toolbarLabel: 'Comments',
  },
  'preview': {
    group: 'row-3-group-2',
    groupLabel: 'Review',
    area: 'top',
    icon: '👁',
    toolbarLabel: 'Preview',
  },
  'view-code': {
    group: 'row-3-group-2',
    groupLabel: 'Review',
    area: 'top',
    icon: '</>',
    toolbarLabel: 'Code',
  },
  'full-screen': {
    group: 'row-3-group-2',
    groupLabel: 'Review',
    area: 'top',
    icon: '⛶',
    toolbarLabel: 'Full screen',
  },
  'word-count': {
    group: 'row-3-group-2',
    groupLabel: 'Review',
    area: 'top',
    icon: '123',
    toolbarLabel: 'Word count',
  },
  'print': {
    group: 'row-3-group-2',
    groupLabel: 'Review',
    area: 'top',
    icon: '🖨',
    toolbarLabel: 'Print',
  },
  'export': {
    group: 'row-3-group-2',
    groupLabel: 'Review',
    area: 'top',
    icon: '⬇',
    toolbarLabel: 'Export',
  },

  'blockquote': {
    group: 'hidden',
    groupLabel: 'Hidden',
    area: 'top',
    icon: '❝',
    toolbarLabel: 'Blockquote',
  },
  'code-sprint': {
    group: 'hidden',
    groupLabel: 'Hidden',
    area: 'top',
    icon: '{}',
    toolbarLabel: 'Code',
  },
  'vertical-alignment': {
    group: 'hidden',
    groupLabel: 'Hidden',
    area: 'top',
    icon: '↕',
    toolbarLabel: 'Vertical alignment',
  },
  'horizontal-alignment': {
    group: 'hidden',
    groupLabel: 'Hidden',
    area: 'top',
    icon: '↔',
    toolbarLabel: 'Horizontal alignment',
  },
  'view-grid-lines': {
    group: 'hidden',
    groupLabel: 'Hidden',
    area: 'top',
    icon: '#',
    toolbarLabel: 'Grid lines',
  },
  'embed': {
    group: 'hidden',
    groupLabel: 'Hidden',
    area: 'top',
    icon: '⧉',
    toolbarLabel: 'Embed',
  },
  'keyboard-shortcuts': {
    group: 'hidden',
    groupLabel: 'Hidden',
    area: 'top',
    icon: '⌨',
    toolbarLabel: 'Shortcuts',
  },
  'error-messages': {
    group: 'hidden',
    groupLabel: 'Hidden',
    area: 'top',
    icon: '⚠',
    toolbarLabel: 'Error messages',
  },
  'show-alerts': {
    group: 'hidden',
    groupLabel: 'Hidden',
    area: 'top',
    icon: '🔔',
    toolbarLabel: 'Alerts',
  },
  'background-linear-gradient': {
    group: 'hidden',
    groupLabel: 'Hidden',
    area: 'top',
    icon: '🌈',
    toolbarLabel: 'Gradient',
  },
  'currency-symbols': {
    group: 'hidden',
    groupLabel: 'Hidden',
    area: 'top',
    icon: '₹',
    toolbarLabel: 'Currency',
  },
  'unicode-symbols': {
    group: 'hidden',
    groupLabel: 'Hidden',
    area: 'top',
    icon: '☯',
    toolbarLabel: 'Unicode',
  },
  'languages': {
    group: 'hidden',
    groupLabel: 'Hidden',
    area: 'top',
    icon: '🌐',
    toolbarLabel: 'Language',
  },
  'ai-integration': {
    group: 'row-4-group-1',
    groupLabel: 'AI',
    area: 'top',
    icon: '🤖',
    toolbarLabel: 'AI',
  },
};

const TOOL_ID_ORDER = [
  'undo',
  'redo',
  'logs',

  'block-styles',
  'font-family',

  'font-sizes',
  'line-height',
  'font-spacing',
  'space-before',
  'space-after',

  'word-art',
  'esignature',
  'text-animation',
  'date-formats',

  'emoji',
  'charmap',
  'insert-shapes',

  'bold',
  'italic',
  'underline',
  'strikethrough',
  'font-color',
  'text-highlight',
  'remove-format',

  'list',
  'sub-list',
  'align-left',
  'align-center',
  'align-right',
  'justify',
  'decrease-indent',
  'increase-indent',
  'sort',
  'show-hide',

  'table',
  'image',
  'video',
  'other-files',
  'link',
  'horizontal-line',

  'elements',
  'layout',
  'gallery',
  'theme',

  'find-replace',
  'comments',
  'preview',
  'view-code',
  'full-screen',
  'word-count',
  'print',
  'export',
  'ai-integration',
];

const normalizeToolId = (value = '') =>
  String(value)
    .trim()
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/[_\s]+/g, '-')
    .replace(/-+/g, '-')
    .toLowerCase();

const TOOL_ALIASES = {
  'undo': 'undo',
  'redo': 'redo',
  'logs': 'logs',

  'block': 'block-styles',
  'block-style': 'block-styles',
  'block-styles': 'block-styles',
  'blockstyles': 'block-styles',

  'fontsize': 'font-sizes',
  'font-size': 'font-sizes',
  'font-sizes': 'font-sizes',
  'fontsizes': 'font-sizes',

  'family': 'font-family',
  'fontfamily': 'font-family',
  'font-family': 'font-family',

  'bold': 'bold',
  'italic': 'italic',
  'underline': 'underline',
  'strikethrough': 'strikethrough',
  'font-color': 'font-color',
  'fontcolor': 'font-color',
  'text-highlight': 'text-highlight',
  'texthighlight': 'text-highlight',
  'remove-format': 'remove-format',
  'removeformat': 'remove-format',
  'blockquote': 'blockquote',
  'code-sprint': 'code-sprint',
  'codesprint': 'code-sprint',

  'list': 'list',
  'sub-list': 'sub-list',
  'sublist': 'sub-list',
  'decrease-indent': 'decrease-indent',
  'decreaseindent': 'decrease-indent',
  'increase-indent': 'increase-indent',
  'increaseindent': 'increase-indent',
  'sort': 'sort',
  'show-hide': 'show-hide',
  'showhide': 'show-hide',
  'align-left': 'align-left',
  'alignleft': 'align-left',
  'align-center': 'align-center',
  'aligncenter': 'align-center',
  'align-right': 'align-right',
  'alignright': 'align-right',
  'justify': 'justify',
  'vertical-alignment': 'vertical-alignment',
  'verticalalignment': 'vertical-alignment',
  'horizontal-alignment': 'horizontal-alignment',
  'horizontalalignment': 'horizontal-alignment',
  'line-height': 'line-height',
  'lineheight': 'line-height',
  'font-spacing': 'font-spacing',
  'fontspacing': 'font-spacing',
  'space-before': 'space-before',
  'spacebefore': 'space-before',
  'space-after': 'space-after',
  'spaceafter': 'space-after',
  'horizontal-line': 'horizontal-line',
  'horizontalline': 'horizontal-line',

  'table': 'table',
  'view-grid-lines': 'view-grid-lines',
  'viewgridlines': 'view-grid-lines',
  'insert-shapes': 'insert-shapes',
  'insertshapes': 'insert-shapes',
  'esignature': 'esignature',
  'e-signature': 'esignature',
  'image': 'image',
  'video': 'video',
  'other-files': 'other-files',
  'otherfiles': 'other-files',
  'word-art': 'word-art',
  'wordart': 'word-art',
  'date-formats': 'date-formats',
  'dateformats': 'date-formats',
  'embed': 'embed',
  'link': 'link',
  'emoji': 'emoji',
  'charmap': 'charmap',
  'currency-symbols': 'currency-symbols',
  'currencysymbols': 'currency-symbols',
  'unicode-symbols': 'unicode-symbols',
  'unicodesymbols': 'unicode-symbols',

  'find-replace': 'find-replace',
  'findreplace': 'find-replace',
  'search-replace': 'find-replace',
  'searchreplace': 'find-replace',
  'comments': 'comments',
  'word-count': 'word-count',
  'wordcount': 'word-count',
  'keyboard-shortcuts': 'keyboard-shortcuts',
  'keyboardshortcuts': 'keyboard-shortcuts',
  'error-messages': 'error-messages',
  'errormessages': 'error-messages',
  'show-alerts': 'show-alerts',
  'showalerts': 'show-alerts',

  'elements': 'elements',
  'layout': 'layout',
  'gallery': 'gallery',
  'margins-padding': 'margins-padding',
  'marginspadding': 'margins-padding',
  'text-animation': 'text-animation',
  'textanimation': 'text-animation',
  'background-linear-gradient': 'background-linear-gradient',
  'backgroundlineargradient': 'background-linear-gradient',

  'preview': 'preview',
  'view-code': 'view-code',
  'viewcode': 'view-code',
  'full-screen': 'full-screen',
  'fullscreen': 'full-screen',
  'theme': 'theme',
  'languages': 'languages',

  'export': 'export',
  'print': 'print',

  'ai': 'ai-integration',
  'ai-integration': 'ai-integration',
  'aiintegration': 'ai-integration',
};

function resolveToolId(tool) {
  const normalized = normalizeToolId(tool?.id || '');
  return TOOL_ALIASES[normalized] || normalized;
}

function buildTool(tool) {
  const resolvedId = resolveToolId(tool);
  const meta = TOOL_META[resolvedId] || {};

  return {
    ...tool,
    id: resolvedId,
    group: meta.group || tool.group || 'general',
    groupLabel: meta.groupLabel || tool.groupLabel || 'General',
    area: meta.area || tool.area || 'top',
    icon: meta.icon || tool.icon || '•',
    toolbarLabel: meta.toolbarLabel || tool.toolbarLabel || tool.label || tool.title || resolvedId,
    toolbarVariant: meta.toolbarVariant || tool.toolbarVariant || null,
  };
}

const TOOL_MAP = new Map(
  RAW_TOOLS.map((tool) => {
    const resolvedId = resolveToolId(tool);
    return [resolvedId, tool];
  })
);

function buildToolsFromIds(ids = []) {
  return ids
    .map((id) => TOOL_ALIASES[normalizeToolId(id)] || normalizeToolId(id))
    .filter((id) => id && id !== 'margin-ruler')
    .map((id) => TOOL_MAP.get(id))
    .filter(Boolean)
    .map(buildTool);
}

const FULL_TOOL_IDS = [...TOOL_ID_ORDER];

const TOOLBAR_PRESETS = {
  minimal: [
    'undo',
    'redo',
    'block-styles',
    'font-sizes',
    'bold',
    'italic',
    'underline',
    'list',
    'align-left',
    'align-center',
    'align-right',
    'link',
    'image',
    'preview',
    'export',
  ],
  basic: [
  'margin-ruler',

  'undo',
  'redo',
  'logs',

  'block-styles',
  'font-family',
  'font-sizes',
  'line-height',
  'font-spacing',
  'space-before',
  'space-after',

  'bold',
  'italic',
  'underline',
  'strikethrough',
  'font-color',
  'text-highlight',
  'remove-format',

  'list',
  'sub-list',
  'align-left',
  'align-center',
  'align-right',
  'justify',
  'decrease-indent',
  'increase-indent',

  'table',
  'image',
  'link',

  'find-replace',
  'comments',
  'preview',
  'view-code',
  'full-screen',
  'print',
  'export',
  'ai-integration',
],
  full: [
    'margin-ruler',
    ...FULL_TOOL_IDS,
  ],
};

const ALL_TOOLS = buildToolsFromIds(FULL_TOOL_IDS);

const DEFAULT_RESPONSIVE_TOOLBAR_BREAKPOINTS = {
  mobile: 680,
  tablet: 1180,
};

function getEditorWidth(editor) {
  return (
    editor?.root?.clientWidth ||
    editor?.root?.offsetWidth ||
    window.innerWidth
  );
}

function getResponsiveToolbarPresetForWidth(
  width,
  requestedPreset = 'full',
  breakpoints = {}
) {
  const normalizedPreset = String(requestedPreset || 'full').trim().toLowerCase();

  if (!['minimal', 'basic', 'full'].includes(normalizedPreset)) {
    return normalizedPreset;
  }

  const mobile = Math.max(
    320,
    Number(breakpoints.mobile ?? DEFAULT_RESPONSIVE_TOOLBAR_BREAKPOINTS.mobile)
  );
  const tablet = Math.max(
    mobile + 1,
    Number(breakpoints.tablet ?? DEFAULT_RESPONSIVE_TOOLBAR_BREAKPOINTS.tablet)
  );

  if (normalizedPreset === 'minimal') return 'minimal';

  if (normalizedPreset === 'basic') {
    return width <= mobile ? 'minimal' : 'basic';
  }

  if (width <= mobile) return 'minimal';
  if (width <= tablet) return 'basic';
  return 'full';
}

function setEditorTools(editor, tools) {
  if (!editor || !Array.isArray(tools) || !tools.length) return;

  editor.tools = tools;
  editor.toolMap = new Map(tools.map((tool) => [tool.id, tool]));

  if (typeof editor.renderToolbar === 'function') {
    editor.renderToolbar();
  }

  if (typeof editor.syncFontFamilyTool === 'function') {
    editor.syncFontFamilyTool();
  }

  if (typeof editor.refreshStatus === 'function') {
    editor.refreshStatus();
  }
}

function installResponsiveToolbar(editor, options = {}) {
  if (editor?.__mnbResponsiveToolbarCleanup) {
    editor.__mnbResponsiveToolbarCleanup();
    delete editor.__mnbResponsiveToolbarCleanup;
  }

  const {
    enabled = true,
    requestedTools,
    requestedPreset = 'full',
    breakpoints = DEFAULT_RESPONSIVE_TOOLBAR_BREAKPOINTS,
  } = options;

  if (!enabled) return;
  if (Array.isArray(requestedTools) && requestedTools.length) return;

  const normalizedPreset = String(requestedPreset || 'full').trim().toLowerCase();
  if (!['minimal', 'basic', 'full'].includes(normalizedPreset)) return;

  let currentPreset = '';

  const apply = () => {
    const width = getEditorWidth(editor);
    const nextPreset = getResponsiveToolbarPresetForWidth(
      width,
      normalizedPreset,
      breakpoints
    );

    if (nextPreset === currentPreset) return;

    currentPreset = nextPreset;

    const ids = TOOLBAR_PRESETS[nextPreset] || TOOLBAR_PRESETS.full;
    const nextTools = buildToolsFromIds(ids);
    if (nextTools.length) {
      setEditorTools(editor, nextTools);
    }
  };

  apply();

  const onWindowResize = () => apply();
  window.addEventListener('resize', onWindowResize);

  let resizeObserver = null;
  if (typeof ResizeObserver !== 'undefined' && editor?.root) {
    resizeObserver = new ResizeObserver(() => apply());
    resizeObserver.observe(editor.root);
  }

  editor.__mnbResponsiveToolbarCleanup = () => {
    window.removeEventListener('resize', onWindowResize);
    if (resizeObserver) resizeObserver.disconnect();
  };
}

function hasMarginRulerToken(ids = []) {
  return ids.some((id) => {
    const normalized = normalizeToolId(id);
    return normalized === 'margin-ruler' || normalized === 'marginruler' || normalized === 'ruler';
  });
}

function applyRulerVisibility(editor, visible) {
  const rulerBar = editor?.root?.querySelector('.mnb-editor-rulerbar');
  if (!rulerBar) return;
  rulerBar.style.display = visible ? '' : 'none';
}

function syncStickyToolbarOffsets(editor) {
  const root = editor?.root;
  if (!root) return;

  const topbar =
    root.querySelector('.mnb-editor-topbar') ||
    root.querySelector('.mnb-editor-topbar-docs');

  if (!topbar) return;

  const apply = () => {
    root.style.setProperty(
      '--mnb-sticky-topbar-height',
      `${Math.ceil(topbar.offsetHeight)}px`
    );
  };

  apply();

  if (typeof ResizeObserver !== 'undefined') {
    const resizeObserver = new ResizeObserver(apply);
    resizeObserver.observe(topbar);

    const onWindowResize = () => apply();
    window.addEventListener('resize', onWindowResize);

    editor.__mnbStickyCleanup = () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', onWindowResize);
    };
    return;
  }

  const onWindowResize = () => apply();
  window.addEventListener('resize', onWindowResize);

  editor.__mnbStickyCleanup = () => {
    window.removeEventListener('resize', onWindowResize);
  };
}

function setToolbarCollapsedState(editor, collapsed) {
  const root = editor?.root;
  if (!root) return;

  const toolbarScroll = root.querySelector('.mnb-toolbar-scroll');
  if (!toolbarScroll) return;

  const isCollapsed = !!collapsed;
  const expandedHeight = Number(root.dataset.mnbToolbarExpandedHeight || 0);
  const collapsedHeight = Number(root.dataset.mnbToolbarCollapsedHeight || 0);

  root.classList.toggle('mnb-toolbar-collapsed', isCollapsed);

  if (expandedHeight > 0) {
    toolbarScroll.style.maxHeight = `${isCollapsed ? collapsedHeight : expandedHeight}px`;
    toolbarScroll.style.overflow = 'hidden';
    toolbarScroll.style.transition = 'max-height .24s ease, opacity .2s ease';
    toolbarScroll.style.opacity = '1';
  }

  const toggleBtn = root.querySelector('.mnb-toolbar-toggle');
  if (toggleBtn) {
    toggleBtn.setAttribute('aria-expanded', String(!isCollapsed));
    toggleBtn.innerHTML = isCollapsed
      ? `<span class="mnb-toolbar-toggle-dots">...</span><span class="mnb-toolbar-toggle-label">Expand tools</span>`
      : `<span class="mnb-toolbar-toggle-dots">...</span><span class="mnb-toolbar-toggle-label">Collapse tools</span>`;
  }
}

function measureToolbarHeights(root, rows = 2) {
  const toolbar = root.querySelector('.mnb-toolbar');
  const toolbarScroll = root.querySelector('.mnb-toolbar-scroll');

  if (!toolbar || !toolbarScroll) {
    return {
      expandedHeight: 0,
      collapsedHeight: 0,
      hasOverflow: false,
    };
  }

  const prevMaxHeight = toolbarScroll.style.maxHeight;
  const prevOverflow = toolbarScroll.style.overflow;
  const prevOpacity = toolbarScroll.style.opacity;

  toolbarScroll.style.maxHeight = 'none';
  toolbarScroll.style.overflow = 'visible';
  toolbarScroll.style.opacity = '1';

  const groups = [...toolbar.querySelectorAll('.mnb-toolbar-group')]
    .filter((el) => el.offsetParent !== null);

  const expandedHeight = Math.ceil(toolbar.scrollHeight);

  if (!groups.length) {
    toolbarScroll.style.maxHeight = prevMaxHeight;
    toolbarScroll.style.overflow = prevOverflow;
    toolbarScroll.style.opacity = prevOpacity;

    return {
      expandedHeight,
      collapsedHeight: expandedHeight,
      hasOverflow: false,
    };
  }

  const rowTops = [];

  groups.forEach((el) => {
    const top = el.offsetTop;
    if (!rowTops.some((value) => Math.abs(value - top) <= 4)) {
      rowTops.push(top);
    }
  });

  rowTops.sort((a, b) => a - b);

  if (rowTops.length <= rows) {
    toolbarScroll.style.maxHeight = prevMaxHeight;
    toolbarScroll.style.overflow = prevOverflow;
    toolbarScroll.style.opacity = prevOpacity;

    return {
      expandedHeight,
      collapsedHeight: expandedHeight,
      hasOverflow: false,
    };
  }

  const cutoffTop = rowTops[rows];
  let visibleBottom = 0;

  groups.forEach((el) => {
    if (el.offsetTop < cutoffTop - 2) {
      visibleBottom = Math.max(visibleBottom, el.offsetTop + el.offsetHeight);
    }
  });

  const collapsedHeight = Math.ceil(visibleBottom + 6);

  toolbarScroll.style.maxHeight = prevMaxHeight;
  toolbarScroll.style.overflow = prevOverflow;
  toolbarScroll.style.opacity = prevOpacity;

  return {
    expandedHeight,
    collapsedHeight,
    hasOverflow: expandedHeight > collapsedHeight + 6,
  };
}

function installToolbarCollapse(editor, options = {}) {
  const root = editor?.root;
  if (!root) return;

  if (editor.__mnbToolbarCollapseCleanup) {
    editor.__mnbToolbarCollapseCleanup();
    delete editor.__mnbToolbarCollapseCleanup;
  }

  const {
    enabled = true,
    collapsed,
    breakpoint = 720,
    rows = 2,
  } = options;

  const topbar =
    root.querySelector('.mnb-editor-topbar') ||
    root.querySelector('.mnb-editor-topbar-docs');

  const toolbarScroll = root.querySelector('.mnb-toolbar-scroll');

  if (!topbar || !toolbarScroll) return;

  let toggleBtn = topbar.querySelector('.mnb-toolbar-toggle');

  if (!enabled) {
    if (toggleBtn) toggleBtn.remove();
    root.classList.remove(
      'mnb-toolbar-can-collapse',
      'mnb-toolbar-collapsed',
      'mnb-toolbar-has-extra'
    );
    toolbarScroll.style.maxHeight = '';
    toolbarScroll.style.overflow = '';
    toolbarScroll.style.opacity = '';
    delete root.dataset.mnbToolbarExpandedHeight;
    delete root.dataset.mnbToolbarCollapsedHeight;
    return;
  }

  root.classList.add('mnb-toolbar-can-collapse');

  if (!toggleBtn) {
    toggleBtn = document.createElement('button');
    toggleBtn.type = 'button';
    toggleBtn.className = 'mnb-toolbar-toggle';
    toggleBtn.style.display = 'none';
    topbar.appendChild(toggleBtn);
  }

  let manualMode = typeof collapsed === 'boolean';
  let manualCollapsed = !!collapsed;

  const updateMeasurements = () => {
    const info = measureToolbarHeights(root, rows);

    root.dataset.mnbToolbarExpandedHeight = String(info.expandedHeight || 0);
    root.dataset.mnbToolbarCollapsedHeight = String(info.collapsedHeight || 0);
    root.classList.toggle('mnb-toolbar-has-extra', info.hasOverflow);

    toggleBtn.style.display = info.hasOverflow ? 'inline-flex' : 'none';

    if (!info.hasOverflow) {
      setToolbarCollapsedState(editor, false);
      toolbarScroll.style.maxHeight = '';
      return info;
    }

    return info;
  };

  const applyState = () => {
    const info = updateMeasurements();
    if (!info || !info.hasOverflow) return;

    if (manualMode) {
      setToolbarCollapsedState(editor, manualCollapsed);
      return;
    }

    const currentWidth = root.clientWidth || root.offsetWidth || window.innerWidth;
    setToolbarCollapsedState(editor, currentWidth <= breakpoint);
  };

  const onToggleClick = () => {
    const hasOverflow = root.classList.contains('mnb-toolbar-has-extra');
    if (!hasOverflow) return;

    const current = root.classList.contains('mnb-toolbar-collapsed');
    manualMode = true;
    manualCollapsed = !current;
    setToolbarCollapsedState(editor, manualCollapsed);
  };

  toggleBtn.addEventListener('click', onToggleClick);

  let resizeObserver = null;
  const onWindowResize = () => applyState();

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => applyState());
    resizeObserver.observe(root);

    const toolbar = root.querySelector('.mnb-toolbar');
    if (toolbar) resizeObserver.observe(toolbar);
  }

  window.addEventListener('resize', onWindowResize);

  requestAnimationFrame(() => applyState());

  editor.__mnbToolbarCollapseCleanup = () => {
    toggleBtn.removeEventListener('click', onToggleClick);
    window.removeEventListener('resize', onWindowResize);
    if (resizeObserver) resizeObserver.disconnect();
  };
}

function toCssSize(value) {
  if (value == null || value === '') return '';
  if (typeof value === 'number') return `${value}px`;
  return String(value);
}

function applyEditorDimensions(editor, width, height) {
  const root = editor?.root;
  if (!root) return;

  const cssWidth = toCssSize(width);
  const cssHeight = toCssSize(height);

  if (cssWidth) {
    root.style.width = cssWidth;
    root.style.maxWidth = '100%';
  }

  if (!cssHeight) return;

  root.style.height = cssHeight;
  root.style.maxHeight = cssHeight;
  root.style.display = 'flex';
  root.style.flexDirection = 'column';
  root.style.overflow = 'hidden';

  const frame =
    root.querySelector('.mnb-editor-frame') ||
    root.querySelector('.mnb-editor-frame-docs');

  const main =
    root.querySelector('.mnb-editor-main') ||
    frame;

  const topbar =
    root.querySelector('.mnb-editor-topbar') ||
    root.querySelector('.mnb-editor-topbar-docs');

  const rulerBar = root.querySelector('.mnb-editor-rulerbar');
  const body = root.querySelector('.mnb-editor-body');
  const statusbar = root.querySelector('.mnb-statusbar');

  if (frame) {
    frame.style.display = 'flex';
    frame.style.flexDirection = 'column';
    frame.style.flex = '1 1 auto';
    frame.style.minHeight = '0';
    frame.style.height = 'auto';
    frame.style.overflow = 'hidden';
  }

  if (main) {
    main.style.display = 'flex';
    main.style.flexDirection = 'column';
    main.style.flex = '1 1 auto';
    main.style.minHeight = '0';
    main.style.height = 'auto';
    main.style.overflow = 'hidden';
  }

  if (topbar) {
    topbar.style.flex = '0 0 auto';
  }

  if (rulerBar) {
    rulerBar.style.flex = '0 0 auto';
  }

  if (body) {
    body.style.flex = '1 1 auto';
    body.style.minHeight = '0';
    body.style.height = 'auto';
    body.style.overflow = 'auto';
  }

  if (statusbar) {
    statusbar.style.flex = '0 0 auto';
    statusbar.style.marginTop = 'auto';
  }
}

function ensureStatusContainer(root, side = 'right') {
  const selector = side === 'left' ? '.mnb-status-left' : '.mnb-status-right';
  let container = root.querySelector(selector);
  if (container) return container;

  const statusbar = root.querySelector('.mnb-statusbar');
  if (!statusbar) return null;

  container = document.createElement('div');
  container.className = side === 'left' ? 'mnb-status-left' : 'mnb-status-right';
  statusbar.appendChild(container);
  return container;
}

function renderBrandingNode(config) {
  const hasLink = !!config.href;
  const node = hasLink ? document.createElement('a') : document.createElement('div');

  node.className = config.className || 'mnb-branding';

  if (hasLink) {
    node.href = config.href;
    node.target = config.target || '_blank';
    node.rel = 'noopener noreferrer';
    node.style.textDecoration = 'none';
    node.style.color = 'inherit';
  }

  node.style.display = 'inline-flex';
  node.style.alignItems = 'center';
  node.style.gap = '8px';

  const label = document.createElement('span');
  label.textContent = config.text || 'MNB Editor';
  node.appendChild(label);

  return node;
}

function applyBranding(editor, branding) {
  const root = editor?.root;
  if (!root) return;

  root.querySelectorAll('.mnb-branding, .mnb-branding-floating').forEach((item) => item.remove());

  if (branding === false || branding == null) return;

  const config = branding === true
    ? { text: 'MNB Editor', position: 'status-right' }
    : typeof branding === 'string'
      ? { text: branding, position: 'status-right' }
      : {
          text: branding.text || 'MNB Editor',
          href: branding.href || branding.url || '',
          target: branding.target,
          position: branding.position || 'status-right',
        };

  if (config.position === 'floating') {
    const node = renderBrandingNode({
      ...config,
      className: 'mnb-branding-floating',
    });

    node.style.position = 'absolute';
    node.style.right = '16px';
    node.style.bottom = '16px';
    node.style.zIndex = '5';
    node.style.padding = '8px 12px';
    node.style.border = '1px solid var(--mnb-border)';
    node.style.borderRadius = '999px';
    node.style.background = 'var(--mnb-panel)';
    node.style.boxShadow = '0 8px 20px rgba(15,23,42,.08)';
    node.style.fontSize = '12px';
    node.style.fontWeight = '700';
    node.style.color = 'var(--mnb-muted)';

    root.appendChild(node);
    return;
  }

  const side = config.position === 'status-left' ? 'left' : 'right';
  const container = ensureStatusContainer(root, side);
  if (!container) return;

  const node = renderBrandingNode({
    ...config,
    className: 'mnb-status-item mnb-branding',
  });

  container.appendChild(node);
}

function normalizeContentLimit(contentLimit) {
  if (!contentLimit) return null;

  if (typeof contentLimit === 'number') {
    return {
      max: contentLimit,
      type: 'chars',
      mode: 'hard',
      showCounter: true,
    };
  }

  const max = Number(contentLimit.max || contentLimit.limit || 0);
  if (!max) return null;

  return {
    max,
    type: contentLimit.type === 'words' ? 'words' : 'chars',
    mode: contentLimit.mode === 'soft' ? 'soft' : 'hard',
    showCounter: contentLimit.showCounter !== false,
    onChange: typeof contentLimit.onChange === 'function' ? contentLimit.onChange : null,
  };
}

function getEditorSurface(editor) {
  const root = editor?.root;
  if (!root) return null;

  return (
    root.querySelector('.mnb-surface') ||
    root.querySelector('.mnb-code-surface') ||
    root.querySelector('.mnb-preview-surface')
  );
}

function getSurfaceText(surface) {
  if (!surface) return '';
  if ('value' in surface) return surface.value || '';
  return (surface.innerText || surface.textContent || '').replace(/\u200B/g, '');
}

function countContentMetric(text, type) {
  if (type === 'words') {
    const words = text.trim().match(/\S+/g);
    return words ? words.length : 0;
  }
  return text.length;
}

function truncateTextToLimit(text, remaining, type) {
  if (!text || remaining <= 0) return '';

  if (type === 'words') {
    const parts = text.match(/\S+\s*/g) || [];
    return parts.slice(0, remaining).join('').trimEnd();
  }

  return text.slice(0, remaining);
}

function insertTextAtCursor(surface, text) {
  if (!surface || !text) return;

  if (surface instanceof HTMLTextAreaElement || surface instanceof HTMLInputElement) {
    const start = surface.selectionStart ?? surface.value.length;
    const end = surface.selectionEnd ?? start;
    surface.setRangeText(text, start, end, 'end');
    surface.dispatchEvent(new Event('input', { bubbles: true }));
    return;
  }

  surface.focus();

  const selection = window.getSelection();
  if (!selection) return;

  if (!selection.rangeCount) {
    const range = document.createRange();
    range.selectNodeContents(surface);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }

  const range = selection.getRangeAt(0);
  range.deleteContents();

  const textNode = document.createTextNode(text);
  range.insertNode(textNode);

  range.setStartAfter(textNode);
  range.collapse(true);
  selection.removeAllRanges();
  selection.addRange(range);

  surface.dispatchEvent(new Event('input', { bubbles: true }));
}

function ensureContentAlertHost(editor) {
  const root = editor?.root;
  if (!root) return null;

  const body = root.querySelector('.mnb-editor-body');
  if (!body) return null;

  let host = body.querySelector('.mnb-limit-alert-host');
  if (host) return host;

  if (getComputedStyle(body).position === 'static') {
    body.style.position = 'relative';
  }

  host = document.createElement('div');
  host.className = 'mnb-limit-alert-host';
  host.style.position = 'sticky';
  host.style.top = '12px';
  host.style.zIndex = '10';
  host.style.display = 'flex';
  host.style.justifyContent = 'flex-end';
  host.style.pointerEvents = 'none';
  host.style.marginBottom = '-42px';
  host.style.paddingRight = '12px';

  body.insertBefore(host, body.firstChild);
  return host;
}

function showEditorLimitAlert(editor, message, kind = 'error') {
  const host = ensureContentAlertHost(editor);
  if (!host) return;

  host.innerHTML = '';

  const alert = document.createElement('div');
  alert.className = `mnb-limit-alert ${kind}`;
  alert.textContent = message;
  alert.style.pointerEvents = 'none';
  alert.style.maxWidth = '320px';
  alert.style.padding = '10px 12px';
  alert.style.borderRadius = '12px';
  alert.style.fontSize = '12px';
  alert.style.fontWeight = '700';
  alert.style.lineHeight = '1.35';
  alert.style.background = kind === 'error' ? '#fef2f2' : '#eff6ff';
  alert.style.color = kind === 'error' ? '#b91c1c' : '#1d4ed8';
  alert.style.border = kind === 'error'
    ? '1px solid rgba(220,38,38,.20)'
    : '1px solid rgba(59,130,246,.20)';
  alert.style.boxShadow = '0 8px 18px rgba(15,23,42,.08)';

  host.appendChild(alert);

  clearTimeout(editor.__mnbLimitAlertTimer);
  editor.__mnbLimitAlertTimer = setTimeout(() => {
    alert.remove();
  }, 2200);
}

function installContentLimit(editor, contentLimit) {
  if (editor.__mnbContentLimitCleanup) {
    editor.__mnbContentLimitCleanup();
    delete editor.__mnbContentLimitCleanup;
  }

  const config = normalizeContentLimit(contentLimit);
  if (!config) return;

  const root = editor?.root;
  const surface = getEditorSurface(editor);
  if (!root || !surface) return;

  const oldCounter = root.querySelector('.mnb-content-limit-indicator');
  if (oldCounter) oldCounter.remove();

  let counterNode = null;
  if (config.showCounter) {
    const statusRight = ensureStatusContainer(root, 'right');
    if (statusRight) {
      counterNode = document.createElement('div');
      counterNode.className = 'mnb-status-item mnb-content-limit-indicator';
      statusRight.appendChild(counterNode);
    }
  }

  let overLimitAlertShown = false;

  const getCount = () => countContentMetric(getSurfaceText(surface), config.type);

  const update = () => {
    const count = getCount();
    const reached = count >= config.max;
    const over = count > config.max;

    if (counterNode) {
      counterNode.textContent = `${count}/${config.max} ${config.type}`;
      counterNode.style.color = reached ? 'var(--mnb-danger)' : 'var(--mnb-muted)';
      counterNode.style.borderColor = reached ? 'rgba(220,38,38,.25)' : 'var(--mnb-border)';
    }

    if (over && !overLimitAlertShown) {
      showEditorLimitAlert(
        editor,
        `${config.type === 'words' ? 'Word' : 'Character'} limit exceeded. Maximum allowed is ${config.max}.`,
        'error'
      );
      overLimitAlertShown = true;
    } else if (!over) {
      overLimitAlertShown = false;
    }

    if (config.onChange) {
      config.onChange({
        count,
        max: config.max,
        reached,
        over,
        type: config.type,
        editor,
      });
    }
  };

  const remaining = () => config.max - getCount();

  const onBeforeInput = (event) => {
    if (config.mode !== 'hard') return;
    if (!event.inputType || !event.inputType.startsWith('insert')) return;
    if (event.inputType === 'insertFromPaste') return;

    const left = remaining();
    if (left <= 0) {
      event.preventDefault();
      showEditorLimitAlert(
        editor,
        `${config.type === 'words' ? 'Word' : 'Character'} limit reached. Maximum allowed is ${config.max}.`,
        'error'
      );
      return;
    }

    const incoming = event.data || '';
    if (!incoming) return;

    const incomingCount = countContentMetric(incoming, config.type);
    if (incomingCount <= left) return;

    event.preventDefault();

    const allowedText = truncateTextToLimit(incoming, left, config.type);
    if (allowedText) {
      insertTextAtCursor(surface, allowedText);
    }

    showEditorLimitAlert(
      editor,
      `${config.type === 'words' ? 'Word' : 'Character'} limit reached. Extra text was not added.`,
      'error'
    );
  };

  const onPaste = (event) => {
    const pastedText =
      (event.clipboardData && event.clipboardData.getData('text')) ||
      '';

    if (!pastedText) return;

    if (config.mode === 'hard') {
      const left = remaining();
      const allowedText = truncateTextToLimit(pastedText, left, config.type);
      const pastedCount = countContentMetric(pastedText, config.type);
      const allowedCount = countContentMetric(allowedText, config.type);

      if (allowedCount === pastedCount) return;

      event.preventDefault();

      if (allowedText) {
        insertTextAtCursor(surface, allowedText);
      }

      showEditorLimitAlert(
        editor,
        `${config.type === 'words' ? 'Word' : 'Character'} limit reached. Pasted content was trimmed to fit ${config.max}.`,
        'error'
      );
      return;
    }

    setTimeout(update, 0);
  };

  const onInput = () => update();

  surface.addEventListener('beforeinput', onBeforeInput);
  surface.addEventListener('paste', onPaste);
  surface.addEventListener('input', onInput);

  update();

  editor.__mnbContentLimitCleanup = () => {
    surface.removeEventListener('beforeinput', onBeforeInput);
    surface.removeEventListener('paste', onPaste);
    surface.removeEventListener('input', onInput);
    if (counterNode) counterNode.remove();
    clearTimeout(editor.__mnbLimitAlertTimer);
    const host = root.querySelector('.mnb-limit-alert-host');
    if (host) host.remove();
  };
}

function resolveToolbarConfig(requestedTools, toolbarPreset, explicitRuler) {
  const hasCustomTools = Array.isArray(requestedTools) && requestedTools.length > 0;

  const sourceIds = hasCustomTools
    ? requestedTools
    : (TOOLBAR_PRESETS[String(toolbarPreset || 'full').trim().toLowerCase()] || TOOLBAR_PRESETS.full);

  const tools = buildToolsFromIds(sourceIds);
  const rulerVisible =
    typeof explicitRuler === 'boolean'
      ? explicitRuler
      : hasMarginRulerToken(sourceIds);

  return {
    tools: tools.length ? tools : ALL_TOOLS,
    rulerVisible,
  };
}

export function mountMNBEditor(target, options = {}) {
  const {
    tools: requestedTools,
    toolbar = 'full',
    ruler,
    width,
    height,
    contentLimit,
    branding = true,
    toolbarCollapsible = true,
    toolbarCollapsed,
    collapseToolbarBelow = 720,
    collapsedToolbarRows = 2,
    responsiveToolbar = true,
    responsiveToolbarBreakpoints = DEFAULT_RESPONSIVE_TOOLBAR_BREAKPOINTS,
    ...restOptions
  } = options;

  const config = resolveToolbarConfig(requestedTools, toolbar, ruler);

  const editor = createEditor(target, {
    ...restOptions,
    tools: config.tools,
  });

  applyEditorDimensions(editor, width, height);
  applyRulerVisibility(editor, config.rulerVisible);
  applyBranding(editor, branding);
  installContentLimit(editor, contentLimit);
  syncStickyToolbarOffsets(editor);

  installResponsiveToolbar(editor, {
    enabled: responsiveToolbar,
    requestedTools,
    requestedPreset: toolbar,
    breakpoints: responsiveToolbarBreakpoints,
  });

  installToolbarCollapse(editor, {
    enabled: toolbarCollapsible,
    collapsed: toolbarCollapsed,
    breakpoint: collapseToolbarBelow,
    rows: collapsedToolbarRows,
  });

  return editor;
}

export { ALL_TOOLS, TOOLBAR_PRESETS };