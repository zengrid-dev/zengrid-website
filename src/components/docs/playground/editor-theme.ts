// CodeMirror chrome for the docs playground — the always-dark warm-ink code
// slab and the exact syntax triplet used by the Expressive Code theme (violet
// keywords, teal strings, salmon class/function names, amber numbers). Kept as
// a builder so the engine can pass in the dynamically-imported CM modules.
interface ThemeDeps {
  EditorView: typeof import('@codemirror/view').EditorView;
  HighlightStyle: typeof import('@codemirror/language').HighlightStyle;
  syntaxHighlighting: typeof import('@codemirror/language').syntaxHighlighting;
  tags: typeof import('@lezer/highlight').tags;
}

export function buildEditorTheme({ EditorView, HighlightStyle, syntaxHighlighting, tags: t }: ThemeDeps) {
  const highlight = HighlightStyle.define([
    { tag: t.comment, color: '#8c8272', fontStyle: 'italic' },
    { tag: [t.keyword, t.operatorKeyword, t.modifier, t.definitionKeyword, t.controlKeyword], color: '#c9a0e8' },
    { tag: [t.string, t.special(t.string)], color: '#8fd6c8' },
    { tag: [t.function(t.variableName), t.className, t.typeName, t.namespace], color: '#f2a583' },
    { tag: [t.number, t.bool, t.null, t.atom], color: '#e3b354' },
    { tag: [t.propertyName, t.definition(t.propertyName)], color: '#cfc7b8' },
    { tag: [t.punctuation, t.bracket, t.brace], color: '#b3a998' },
    { tag: t.variableName, color: '#f1ece1' },
  ]);

  const theme = EditorView.theme(
    {
      '&': { color: '#f1ece1', backgroundColor: '#1e1a15', fontSize: '0.82rem' },
      '.cm-scroller': {
        fontFamily: '"JetBrains Mono Variable", ui-monospace, monospace',
        lineHeight: '1.7',
      },
      '.cm-content': { caretColor: '#f2764e' },
      '.cm-gutters': { backgroundColor: '#171410', color: '#5f584c', border: 'none' },
      '.cm-activeLine': { backgroundColor: '#ffffff08' },
      '.cm-activeLineGutter': { backgroundColor: '#ffffff0f', color: '#8c8272' },
      '&.cm-focused': { outline: 'none' },
      '.cm-cursor': { borderLeftColor: '#f2764e' },
      '.cm-selectionBackground, .cm-content ::selection': { backgroundColor: '#f2764e40' },
      '&.cm-focused .cm-selectionBackground': { backgroundColor: '#f2764e40' },
    },
    { dark: true }
  );

  return [syntaxHighlighting(highlight), theme];
}
