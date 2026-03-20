# MNBEditor

A browser-based rich text editor with a document-style workspace, configurable toolbars, visual/code/preview modes, font management, page ruler controls, alerts, modal forms, and an extensible tool system.

## What it includes

- Rich text formatting tools
- Toolbar presets: `minimal`, `basic`, `full`
- Visual editor, HTML code view, and preview mode
- Margin ruler and page layout controls
- Table insertion and manipulation helpers
- Comments, media, embeds, gallery, export, print, themes, and mores
- Custom font support via web fonts and uploaded local fonts
- Content limits with counters and enforcement
- Extensible tool API with `buttonTool(...)` and `selectTool(...)`

## Source layout

```text
mnb-editor/
├─ mnb-editor.main.js          # high-level mount API and toolbar presets
├─ core/
│  ├─ editor-core.js           # MNBEditor class and runtime/editor logic
│  └─ toolkit.js               # tool helper wrappers
└─ tools/
   ├─ 01-undo.js
   ├─ 02-redo.js
   ├─ 03-logs.js
   ├─ ...
   └─ 66-print.js
```

## Installation

The provided code is structured as source files imported directly in the browser/app. In the files you shared, there is no package manifest or published package metadata, so the safest integration path is source-based.

### Option 1: use the source files directly

```html
<div id="editor"></div>
<script type="module">
  import { mountMNBEditor } from "./mnb-editor.main.js";

  const editor = mountMNBEditor("#editor", {
    value: "<p>Hello MNBEditor</p>",
    placeholder: "Start typing here...",
    toolbar: "full",
    theme: "light",
    width: 1200,
    height: 760,
  });

  window.editor = editor;
</script>
```

### Option 2: integrate in your app bundle

```js
import { mountMNBEditor } from "./mnb-editor.main.js";

const editor = mountMNBEditor("#editor", {
  toolbar: "basic",
  value: "<p>Ready</p>",
});
```

## Public entry points

### `mountMNBEditor(target, options)`

Recommended application entry point.

It resolves the toolbar preset or custom tool list, creates the core editor, applies dimensions, ruler visibility, branding, content limits, sticky toolbar offsets, and toolbar collapse behavior.

Main supported options:

- `tools`
- `toolbar`
- `ruler`
- `width`
- `height`
- `contentLimit`
- `branding`
- `toolbarCollapsible`
- `toolbarCollapsed`
- `collapseToolbarBelow`
- `collapsedToolbarRows`
- plus all `createEditor(...)` options

### `createEditor(target, options)`

Lower-level entry point that creates a raw `MNBEditor` instance.

Useful when you want to pass your own tool list and skip the mount-layer conveniences.

## Toolbar presets

### `minimal`

A compact editing toolbar.

Includes:

- undo / redo
- block styles
- font sizes
- bold / italic / underline
- list
- left / center / right align
- link
- image
- preview
- export

### `basic`

A practical day-to-day preset with ruler, history, text controls, formatting, layout, tables, comments, preview/code/fullscreen, print, and export.

### `full`

Includes the margin ruler token plus the full built-in tool set imported by `mnb-editor.main.js`.

## Quick start

### Full editor

```js
import { mountMNBEditor } from "./mnb-editor.main.js";

const editor = mountMNBEditor("#editor", {
  value: "<p>Hello world</p>",
  placeholder: "Start typing here...",
  theme: "light",
  toolbar: "full",
  width: 1200,
  height: 760,
});
```

### Smaller editor

```js
import { mountMNBEditor } from "./mnb-editor.main.js";

const editor = mountMNBEditor("#editor", {
  toolbar: "basic",
  height: 640,
  branding: false,
});
```

### Core editor only

```js
import { createEditor } from "./core/editor-core.js";
import boldTool from "./tools/07-bold.js";
import italicTool from "./tools/08-italic.js";

const editor = createEditor("#editor", {
  value: "<p>Custom setup</p>",
  tools: [boldTool, italicTool],
});
```

## Core editor options

Options visible in the `MNBEditor` constructor include:

- `value`
- `placeholder`
- `theme`
- `debug`
- `maxHistory`
- `alertPosition`
- `tools`
- `fontUploadAccept`
- `defaultFontFamily`
- `fontFamilies`
- `webFonts`
- `pageWidth`
- `marginLeft`
- `marginRight`

## Content API

Useful methods exposed by the core editor include:

- `setHTML(html, record = true)`
- `getHTML()`
- `getText()`
- `toggleCodeView()`
- `togglePreview()`
- `updatePreview()`
- `selectedRange()`
- `getSelectedText()`
- `insertHTML(html, preferredRange)`
- `insertText(text, preferredRange)`
- `surroundSelection(tagName, options, preferredRange)`
- `ensureSelectionText(fallbackText = 'Text')`
- `getSelectedBlock()`
- `getSelectedCell()`
- `applyBlockStyle(styles, attrs)`
- `toggleBlockClass(className)`
- `executeTool(id, value)`
- `exec(command, value = null, reason = command)`
- `saveHistory(reason)`
- `undo()`
- `redo()`
- `alert(message, type, timeout)`
- `form(title, fields, options)`
- `pickFiles({ accept, multiple })`
- `setTheme(theme)`
- `setFontFamily(family)`
- `registerFontFace(name, file)`
- `registerExternalFont(name, href, familyValue, options)`
- `insertTable(rows, cols)`
- `addTableRow()`
- `addTableColumn()`
- `deleteTableRow()`
- `deleteTableColumn()`
- `mergeCellRight()`
- `removeTable()`
- `setTableBorderMode(mode)`
- `download(filename, content, mime)`
- `print()`
- `toggleFullscreen()`

## Tool authoring

Tool helpers:

```js
import { buttonTool, selectTool } from "./core/toolkit.js";
```

### Button tool

```js
import { buttonTool } from "../core/toolkit.js";

export default buttonTool({
  id: "hello",
  label: "Hello",
  icon: "👋",
  title: "Insert greeting",
  async run(editor) {
    editor.insertText("Hello");
    editor.alert("Greeting inserted.", "success");
  },
});
```

### Select tool

```js
import { selectTool } from "../core/toolkit.js";

export default selectTool({
  id: "callout-style",
  label: "Callout style",
  title: "Callout style",
  options: [
    { label: "Info", value: "info" },
    { label: "Success", value: "success" },
    { label: "Warning", value: "warning" },
  ],
  run(editor, value) {
    editor.applyBlockStyle({
      borderLeft: "4px solid #4f46e5",
      padding: "12px 16px",
    });
    return value;
  },
});
```

### Common tool fields

- `id`
- `label`
- `title`
- `icon`
- `kind`
- `group`
- `groupLabel`
- `area`
- `toolbarLabel`
- `toolbarVariant`
- `options` / `items` / `choices`
- `shortcut`
- `usage` / `helpText` / `description`
- `run(editor, value)`
- `onRendered(editor, element)`

## Forms inside tools

```js
const values = await editor.form("Insert badge", [
  { name: "text", label: "Text", type: "text", value: "New" },
  {
    name: "variant",
    label: "Variant",
    type: "select",
    value: "info",
    options: ["info", "success", "warning"],
  },
]);

if (!values) return;
editor.insertHTML(`<span class="mnb-badge">${values.text}</span>`);
```

Supported field types include:

- `text`
- `number`
- `color`
- `textarea`
- `select`
- `checkbox`
- `file`

## Fonts

MNBEditor supports:

1. default built-in fonts
2. external web fonts
3. uploaded local font files

### Web font example

```js
mountMNBEditor("#editor", {
  webFonts: [
    {
      label: "Poppins",
      href: "https://fonts.googleapis.com/css2?family=Poppins:wght@400;600&display=swap",
      value: "Poppins, sans-serif",
    },
  ],
});
```

### Accepted uploaded font formats

- `.ttf`
- `.otf`
- `.woff`
- `.woff2`

## Branding

### Disable branding

```js
mountMNBEditor("#editor", {
  branding: false,
});
```

### String branding

```js
mountMNBEditor("#editor", {
  branding: "Powered by My Product",
});
```

### Full branding config

```js
mountMNBEditor("#editor", {
  branding: {
    text: "My Product",
    href: "https://example.com",
    target: "_blank",
    position: "status-right",
  },
});
```

Supported positions are status-based placements and a `floating` pill-style badge.

## Content limits

### Numeric shorthand

```js
mountMNBEditor("#editor", {
  contentLimit: 500,
});
```

This becomes a hard character limit with a counter.

### Full config

```js
mountMNBEditor("#editor", {
  contentLimit: {
    max: 300,
    type: "words",
    mode: "soft",
    showCounter: true,
    onChange({ count, max, reached, over, type, editor }) {
      console.log(count, max, reached, over, type);
    },
  },
});
```

Supported values:

- `type`: `chars` or `words`
- `mode`: `hard` or `soft`

## Ruler and page layout

```js
mountMNBEditor("#editor", {
  pageWidth: 920,
  marginLeft: 72,
  marginRight: 72,
  ruler: true,
});
```

The ruler updates CSS custom properties for page width and left/right document margins.

## Toolbar collapse

```js
mountMNBEditor("#editor", {
  toolbar: "full",
  toolbarCollapsible: true,
  toolbarCollapsed: false,
  collapseToolbarBelow: 720,
  collapsedToolbarRows: 2,
});
```

This is handled by the mount layer and automatically measures toolbar row height to collapse overflow groups.

## Views

MNBEditor supports three working modes:

- visual mode
- code mode
- preview mode

Preview output is rendered inside an isolated iframe and receives external font links, generated `@font-face` CSS, and editor content.

## Tables

```js
editor.insertTable(3, 4);
editor.addTableRow();
editor.addTableColumn();
editor.mergeCellRight();
editor.setTableBorderMode("outside");
```

The border mode is stored on `table.dataset.borderMode` so your CSS can interpret modes such as:

- `none`
- `all`
- `outside`
- `inside`
- `top`
- `bottom`
- `left`
- `right`

## History model

History is snapshot-based.

- the editor keeps `history` and `future`
- snapshots contain HTML, a reason, and a timestamp
- `maxHistory` defaults to `80`

## Recommended extension rules

- Prefer editor helpers over raw DOM mutation
- Preserve selection-aware behavior when using modals/popovers
- Call `saveHistory(...)` for meaningful state changes
- Give users visible feedback with `editor.alert(...)`
- Make sure preview mode can render your custom output

## Practical notes

- Some formatting still relies on `document.execCommand(...)`
- Preview styles are isolated inside the iframe
- Code view should stay in sync with visual mode
- Select-style tools should provide `options`, `items`, or `choices`

## Contributor checklist

Before merging a new tool or editor feature, verify:

- visual mode works
- selection is preserved after forms/popovers
- undo/redo still works
- preview renders correctly
- code view stays compatible
- user feedback exists for success/failure
- toolbar metadata is updated if needed

## License / packaging note

No license file or package metadata was included in the provided source snapshot. Add your project’s own package metadata, build process, and license section if you plan to publish or distribute MNBEditor as a package.
