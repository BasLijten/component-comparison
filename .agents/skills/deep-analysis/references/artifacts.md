# Artifact File Naming Conventions

All gathered artifacts are saved to `data/comparisons/{component-slug}/gathered/`.

`{component-slug}` = component name lowercased, non-alphanumeric characters replaced with hyphens.

## Per-brand files

For each brand instance, use the pattern `{brand}-{component-slug}-{suffix}`:

| File | Description |
|------|-------------|
| `{brand}-{comp}-component.png` | Cropped component screenshot (1440px desktop) |
| `{brand}-{comp}-full-page.png` | Full page screenshot |
| `{brand}-{comp}-320.png` | Component at 320px mobile viewport |
| `{brand}-{comp}-768.png` | Component at 768px tablet viewport |
| `{brand}-{comp}-1024.png` | Component at 1024px small desktop viewport |
| `{brand}-{comp}-1440.png` | Component at 1440px large desktop viewport |
| `{brand}-{comp}.html` | Full outerHTML of the component |
| `{brand}-{comp}-skeleton.html` | Class-stripped semantic HTML skeleton |
| `{brand}-{comp}-styles.json` | Computed styles per element |
| `{brand}-{comp}-interactions.json` | Observed behaviors and state transitions |

## styles.json structure

```json
{
  "root": {
    "display": "flex",
    "flexDirection": "column",
    "gap": "16px",
    "backgroundColor": "#ffffff",
    "color": "#1a1a1a",
    "fontFamily": "'Brand Sans', sans-serif",
    "fontSize": "16px",
    "padding": "24px",
    "borderRadius": "8px"
  },
  "children": [
    {
      "tag": "button",
      "role": "accordion trigger",
      "styles": { }
    }
  ]
}
```

## interactions.json structure

```json
{
  "states": ["collapsed", "expanded"],
  "defaultState": "collapsed",
  "transitions": [
    { "from": "collapsed", "to": "expanded", "trigger": "click header" },
    { "from": "expanded", "to": "collapsed", "trigger": "click header" }
  ],
  "keyboard": {
    "tab": "moves focus to next header",
    "enter": "toggles current item",
    "space": "toggles current item",
    "arrowDown": "moves to next header",
    "arrowUp": "moves to previous header"
  },
  "animation": {
    "type": "slide",
    "duration": "300ms",
    "easing": "ease-in-out",
    "prefersReducedMotion": false
  },
  "multipleOpen": false
}
```
