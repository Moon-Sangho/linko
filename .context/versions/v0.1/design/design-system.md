# Linko — Design System

_Written by: /agent-designer | Last updated: 2026-03-15_

---

## 1. Design Philosophy

**Clean. Fast. Yours.**

Linko is a productivity tool, not a content destination. The UI should disappear and let the user focus on their bookmarks. Inspired by Raycast, Linear, and Notion — but for local-first data management.

- Dark mode primary (light mode optional, not in MVP)
- Density: medium — enough breathing room to read, tight enough to show many bookmarks
- Every pixel earns its place. No decorative chrome.

---

## 2. Color Palette

All values are CSS custom properties. Tailwind config extends these.

### Base (Dark Mode)

| Token                  | Hex       | Description                        |
|------------------------|-----------|------------------------------------|
| `--color-bg-base`      | `#0f1117` | App background                     |
| `--color-bg-surface`   | `#171b24` | Sidebar, modals, card backgrounds  |
| `--color-bg-elevated`  | `#1e2330` | Hover states, input backgrounds    |
| `--color-bg-overlay`   | `#252a38` | Dropdown menus, tooltips           |
| `--color-border`       | `#2a3045` | Dividers, input borders            |
| `--color-border-focus` | `#4a5568` | Focused element borders            |

### Text

| Token                  | Hex       | Description                        |
|------------------------|-----------|------------------------------------|
| `--color-text-primary` | `#e8eaf0` | Headings, main content             |
| `--color-text-secondary`| `#9099b0` | Subdued labels, metadata           |
| `--color-text-tertiary`| `#5a6480` | Placeholders, disabled             |
| `--color-text-inverse` | `#0f1117` | Text on accent backgrounds         |

### Accent (Brand)

| Token                   | Hex       | Description                        |
|-------------------------|-----------|------------------------------------|
| `--color-accent`        | `#5b6cf9` | Primary interactive elements       |
| `--color-accent-hover`  | `#6b7cff` | Hover state                        |
| `--color-accent-subtle` | `#1e2340` | Accent background (tag chips, etc) |
| `--color-accent-muted`  | `#3a4580` | Active sidebar items               |

### Semantic

| Token                   | Hex       | Description            |
|-------------------------|-----------|------------------------|
| `--color-success`       | `#34d399` | Import success, saved  |
| `--color-success-subtle`| `#0d2e22` | Success background     |
| `--color-warning`       | `#fbbf24` | Duplicate URL warning  |
| `--color-warning-subtle`| `#2d2108` | Warning background     |
| `--color-danger`        | `#f87171` | Delete, error states   |
| `--color-danger-subtle` | `#2d1010` | Danger background      |

---

## 3. Typography

### Font Stack

```css
--font-sans: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
             Helvetica, Arial, sans-serif, "Apple Color Emoji";
--font-mono: "SF Mono", "Fira Code", "Cascadia Code", Consolas,
             "Courier New", monospace;
```

No custom web fonts — system fonts load instantly and match the OS feel.

### Scale

| Token           | Size    | Weight | Line Height | Usage                        |
|-----------------|---------|--------|-------------|------------------------------|
| `text-xs`       | 11px    | 400    | 1.4         | Tags, counts, timestamps     |
| `text-sm`       | 13px    | 400    | 1.5         | Body, metadata, inputs       |
| `text-base`     | 14px    | 400    | 1.6         | Default body text            |
| `text-md`       | 15px    | 500    | 1.5         | Bookmark titles              |
| `text-lg`       | 17px    | 600    | 1.4         | Section headings             |
| `text-xl`       | 20px    | 600    | 1.3         | Modal headings               |
| `text-2xl`      | 24px    | 700    | 1.2         | Empty state headings         |

---

## 4. Spacing Scale

8px base unit. All spacing is multiples of 4px.

| Token  | Value | Tailwind Class |
|--------|-------|----------------|
| `sp-1` | 4px   | `p-1`, `m-1`   |
| `sp-2` | 8px   | `p-2`, `m-2`   |
| `sp-3` | 12px  | `p-3`, `m-3`   |
| `sp-4` | 16px  | `p-4`, `m-4`   |
| `sp-5` | 20px  | `p-5`, `m-5`   |
| `sp-6` | 24px  | `p-6`, `m-6`   |
| `sp-8` | 32px  | `p-8`, `m-8`   |

---

## 5. Border Radius

| Token      | Value | Usage                          |
|------------|-------|--------------------------------|
| `radius-sm`| 4px   | Tags, small chips              |
| `radius-md`| 6px   | Inputs, buttons                |
| `radius-lg`| 10px  | Cards, modals                  |
| `radius-xl`| 14px  | Search overlay, large panels   |

---

## 6. Shadows / Elevation

```css
--shadow-sm:  0 1px 3px rgba(0,0,0,0.4);        /* dropdown items */
--shadow-md:  0 4px 12px rgba(0,0,0,0.5);        /* modals, dialogs */
--shadow-lg:  0 12px 40px rgba(0,0,0,0.6);       /* search overlay */
```

---

## 7. Iconography

- Library: **Lucide React** (consistent stroke-based icons)
- Default size: 16px in UI, 20px in empty states
- Stroke width: 1.5px
- Color: inherits text color

Key icons used:
| Context              | Icon             |
|----------------------|------------------|
| Search               | `Search`         |
| Add bookmark         | `Plus`           |
| Edit                 | `Pencil`         |
| Delete               | `Trash2`         |
| Open in browser      | `ExternalLink`   |
| Tag                  | `Tag`            |
| Settings             | `Settings`       |
| Import               | `Upload`         |
| Export               | `Download`       |
| Favicon fallback     | `Globe`          |
| Duplicate warning    | `AlertTriangle`  |
| Success              | `CheckCircle`    |

---

## 8. Motion

Subtle only. Linko is a productivity tool — animation should never delay the user.

| Token               | Value        | Usage                         |
|---------------------|--------------|-------------------------------|
| `duration-fast`     | 80ms         | Hover state changes           |
| `duration-normal`   | 150ms        | Modal open/close, transitions |
| `easing-default`    | `ease-out`   | All standard transitions      |

No spring animations in MVP. Framer Motion not included.

---

## 9. Tailwind Config Extension

```js
// tailwind.config.js (relevant tokens)
theme: {
  extend: {
    colors: {
      bg: {
        base:     'var(--color-bg-base)',
        surface:  'var(--color-bg-surface)',
        elevated: 'var(--color-bg-elevated)',
        overlay:  'var(--color-bg-overlay)',
      },
      border: {
        DEFAULT: 'var(--color-border)',
        focus:   'var(--color-border-focus)',
      },
      text: {
        primary:   'var(--color-text-primary)',
        secondary: 'var(--color-text-secondary)',
        tertiary:  'var(--color-text-tertiary)',
      },
      accent: {
        DEFAULT: 'var(--color-accent)',
        hover:   'var(--color-accent-hover)',
        subtle:  'var(--color-accent-subtle)',
        muted:   'var(--color-accent-muted)',
      },
    },
    fontFamily: {
      sans: ['var(--font-sans)'],
      mono: ['var(--font-mono)'],
    },
  }
}
```
