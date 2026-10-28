---
name: xBO
description: Back office for FMCG operations, built like a native desktop.
colors:
  primary: "#006f7c"
  primary-hover: "#00606d"
  primary-soft: "#d8f3f6"
  focus-ring: "#0094a2"
  desktop: "#d3e8ea"
  window: "#ffffff"
  chrome: "#f3f6f7"
  raised: "#f9fafb"
  hairline: "#dbe1e2"
  field-border: "#868e90"
  ink: "#172023"
  ink-muted: "#535d61"
  ink-subtle: "#666f72"
  danger: "#c22826"
  warning: "#9a5a00"
  warning-fill: "#edb345"
  success: "#187c49"
  dark-desktop: "#071012"
  dark-window: "#151a1d"
  dark-chrome: "#101517"
  dark-raised: "#1c2124"
  dark-hairline: "#2c3134"
  dark-field-border: "#636a6d"
  dark-ink: "#e9eeef"
  dark-ink-muted: "#a4acb0"
  dark-ink-subtle: "#8b9497"
  dark-primary: "#47bfc5"
  dark-primary-soft: "#11393e"
  dark-danger: "#f66d67"
  dark-warning: "#eeb154"
  dark-success: "#5ec386"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI Variable Display', 'Segoe UI', system-ui, sans-serif"
    fontSize: "20px"
    fontWeight: 600
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif"
    fontSize: "17px"
    fontWeight: 600
    lineHeight: 1.3
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.45
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.4
  label:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.3
    letterSpacing: "0.01em"
  figures:
    fontFamily: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI Variable Text', 'Segoe UI', system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    fontFeature: "'tnum' 1"
rounded:
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "20px"
  "6": "24px"
  "8": "32px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.window}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "28px"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
  button-secondary:
    backgroundColor: "{colors.window}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "28px"
  field:
    backgroundColor: "{colors.window}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
    height: "28px"
  window:
    backgroundColor: "{colors.window}"
    rounded: "{rounded.lg}"
  window-chrome:
    backgroundColor: "{colors.chrome}"
    height: "40px"
  menu:
    backgroundColor: "{colors.raised}"
    rounded: "{rounded.md}"
    padding: "4px"
  taskbar:
    backgroundColor: "{colors.raised}"
    rounded: "{rounded.xl}"
    height: "52px"
  selection-row:
    backgroundColor: "{colors.primary-soft}"
    textColor: "{colors.ink}"
---

# Design System: xBO

## 1. Overview

**Creative North Star: "The Operating System for the Back Office"**

xBO should look like the operating system itself grew an ERP. The user is at a desk under office light, with several documents open, moving fast with the keyboard. Every surface follows the grammar people already trust from macOS and Windows 11: a menu bar that belongs to the focused window, a taskbar of running work, windows that open, stack, snap and remember where they were. Familiarity is the feature. Craft shows in alignment, rhythm, exact figures and calm restraint, not in ornament.

Density is a virtue here. A clerk sees forty order lines without scrolling, every number in tabular figures and right-aligned, every label exact. Hierarchy comes from type weight, spacing and the two neutral layers (window and chrome), not from boxes, cards and colour. Colour is a signal: the deep teal marks the primary action, the current selection and focus; red, amber and green mark state, always with an icon and words.

This system rejects, by name, the PRODUCT.md anti-references: **SAP GUI / classic SAP** (grey forms, cryptic codes, dated chrome), **generic SaaS admin** (sidebar + stat cards + charts), **Odoo and typical web ERPs** (busy pages, form-after-form navigation that loses context) and **over-styled glass UI** (heavy blur and gradients behind data).

The default theme is light, because the scene is a lit office in the working day; dark follows the operating system for evening shifts and warehouses.

**Key Characteristics:**
- Desktop grammar: menu bar, taskbar, Start launcher, command palette, windows with snap layouts.
- Two neutral layers: white content, cool chrome for toolbars, sidebars and title bars.
- One deep teal accent, under 10% of any screen.
- Native system typography with tabular figures.
- Window chrome follows the user's OS: macOS traffic lights or Windows caption buttons.
- Responsive motion: 150 to 220 ms, ease-out, state only.

## 2. Colors

A restrained, cool-neutral palette with a single deep teal voice and a strict semantic set.

### Primary
- **Harbour Teal** (`#006f7c`, oklch 0.49 0.095 207): primary buttons, the selected row marker, links, active tab underline, focus target. Never fills large surfaces. Hover deepens to `#00606d`.
- **Shallow Water** (`#d8f3f6`): selection background for rows, list items and calendar days; text on it stays ink (5.1:1 for teal text).
- **Signal Teal** (`#0094a2`): the 2px focus ring only.

### Neutral
- **Desk Mist** (`#d3e8ea`): the desktop behind windows, a quiet tonal field of the brand hue. Nothing sits on it except windows, the menu bar and the taskbar.
- **Paper White** (`#ffffff`): window content, grids, forms.
- **Chrome Grey** (`#f3f6f7`): title bars, toolbars, sidebars, grid headers: the second neutral layer.
- **Raised Grey** (`#f9fafb`): menus, popovers, the taskbar and launcher when transparency is reduced.
- **Hairline** (`#dbe1e2`): dividers and window outlines (decorative boundaries only).
- **Field Border** (`#868e90`): input and checkbox outlines (3.35:1, meets the 3:1 UI component rule).
- **Ink** (`#172023`): primary text (16.6:1). **Muted Ink** (`#535d61`): secondary text and labels (6.8:1). **Subtle Ink** (`#666f72`): placeholders and timestamps (5.2:1).

### Semantic
- **Danger** (`#c22826`): blocked, failed, overdue, destructive actions.
- **Warning** (`#9a5a00`, text) with **Amber** (`#edb345`, fills and icons only): needs attention, near expiry, credit warning.
- **Success** (`#187c49`): posted, synced, paid.

Dark theme mirrors every role: desktop `#071012`, window `#151a1d`, chrome `#101517`, raised `#1c2124`, hairline `#2c3134`, field border `#636a6d`, ink `#e9eeef`, muted `#a4acb0`, subtle `#8b9497`, primary `#47bfc5` (text on it is dark ink), selection `#11393e`, danger `#f66d67`, warning `#eeb154`, success `#5ec386`. All text pairs measured at 4.5:1 or better in both themes.

### Named Rules
**The One Voice Rule.** Teal appears on under 10% of any screen: primary action, selection, focus, links. Never as decoration, never as a header band, never as an icon tint for its own sake.

**The Never-Colour-Alone Rule.** Every state colour travels with an icon and a word. A red cell also says "Blocked".

## 3. Typography

**Display Font:** System UI (SF Pro on macOS, Segoe UI Variable on Windows, the distro sans on Linux)
**Body Font:** the same system family
**Figures:** the same family with tabular numerals (`font-variant-numeric: tabular-nums`)

**Character:** One native family, so xBO reads as part of the operating system. Weight and size do all the hierarchy; nothing is downloaded.

### Hierarchy
- **Display** (600, 20px, 1.25, -0.01em): window hero titles such as a document number on its own window.
- **Headline** (600, 17px, 1.3): section heads inside a window.
- **Title** (600, 15px, 1.35): panel and group titles, dialog titles.
- **Body** (400, 13px, 1.45): everything users read and type: fields, grid cells, menus. Prose capped at 70ch.
- **Caption** (400, 12px, 1.4): helper text, timestamps, secondary grid lines.
- **Label** (500, 11px, +0.01em): field labels, column headers, taskbar tooltips. Sentence case, never all caps.

### Named Rules
**The Tabular Rule.** Every amount, quantity and date in a grid or form uses tabular figures and is right-aligned (dates left-aligned in ISO-like order). Columns of numbers must line up to the pixel.

**The No-Shouting Rule.** No uppercase labels, no letter-spaced eyebrows. Sentence case everywhere.

## 4. Elevation

Hybrid: flat surfaces inside windows (layering by the two neutral tones and hairlines), real shadows only for things that float above the desktop: windows, menus, popovers, the taskbar. The focused window casts the deepest shadow; unfocused windows flatten so focus is readable from across the room.

### Shadow Vocabulary
- **Window, focused** (`0 0 0 1px rgb(23 32 35 / 0.10), 0 24px 56px -16px rgb(10 25 30 / 0.32), 0 8px 18px -8px rgb(10 25 30 / 0.18)`): the active window.
- **Window, inactive** (`0 0 0 1px rgb(23 32 35 / 0.08), 0 10px 28px -14px rgb(10 25 30 / 0.20)`): every other window.
- **Popover** (`0 0 0 1px rgb(23 32 35 / 0.10), 0 12px 32px -8px rgb(10 25 30 / 0.24)`): menus, launcher, command palette, tooltips.
- **Taskbar** (`0 0 0 1px rgb(23 32 35 / 0.08), 0 8px 24px -10px rgb(10 25 30 / 0.22)`).

### Named Rules
**The OS-Only Translucency Rule.** Backdrop blur is allowed only where the operating system itself uses it: the menu bar, the taskbar and floating popovers. Never behind a grid, form or document. With reduce-transparency on, these become opaque Raised Grey.

## 5. Components

Refined and restrained: every control is the size and shape users expect from a native app, with all states (default, hover, focus, active, disabled, loading, error).

### Buttons
- **Shape:** gently rounded (6px), 28px tall, 12px horizontal padding, body type 500.
- **Primary:** Harbour Teal fill, white text; one per window toolbar at most.
- **Secondary:** white fill, Field Border outline, ink text; hover takes Chrome Grey.
- **Quiet (toolbar):** transparent until hover; icon plus label.
- **Focus:** 2px Signal Teal ring offset 1px, always visible on keyboard focus.

### Inputs / Fields
- **Style:** 28px, white, 1px Field Border, 6px radius.
- **Focus:** border becomes teal plus the 2px focus ring.
- **Error:** Danger border plus an inline message with icon under the field; never only a red outline.
- **Read-only (posted documents):** no border, Chrome Grey background, text stays selectable.

### Windows (signature component)
- **Frame:** 10px radius, Paper White body, Chrome Grey title bar 40px tall with the window title (title type) and an app icon.
- **Chrome style:** macOS (red, amber, green traffic lights on the left, title centred) or Windows (minimise, maximise, close on the right; close turns red on hover), following the user's OS by default.
- **Behaviour:** drag by title bar; resize from all edges and corners; double-click title to maximise; drag to a screen edge to snap halves, to a corner for quarters, to the top to maximise, with a translucent teal preview; hover the maximise button for a snap-layout flyout.
- **Motion:** open scales from 0.96 and fades in (200 ms, ease-out-quint); minimise shrinks toward the taskbar (180 ms). Reduced motion: opacity only.

### Menu bar and taskbar
- **Menu bar:** 30px, translucent Raised Grey, the xBO mark, the focused app's name in 600 weight, its menus, and on the right organisation, sync status, theme and clock.
- **Taskbar:** centred, 52px, 14px radius, floating 8px above the screen edge; Start, search, pinned and running apps with a small teal running indicator; the focused app's indicator widens.

### Grids
- **Header:** Chrome Grey, label type, sticky.
- **Rows:** 28px compact or 34px comfortable; hairline dividers; hover tints Chrome Grey; selection uses Shallow Water with a teal marker inset on the first cell.
- **Numbers:** tabular, right-aligned.

### Navigation inside windows
- **Sidebar:** Chrome Grey, 13px items, 28px rows, selected item in Shallow Water with teal text.

## 6. Do's and Don'ts

### Do:
- **Do** keep teal under 10% of a screen (The One Voice Rule).
- **Do** pair every status colour with an icon and a word (The Never-Colour-Alone Rule).
- **Do** use tabular, right-aligned figures for every amount and quantity (The Tabular Rule).
- **Do** give every action a keyboard shortcut and a command palette entry.
- **Do** keep window chrome native to the user's OS and let them switch it in Settings.
- **Do** keep transitions between 150 and 220 ms with ease-out curves, and replace motion with a fade under `prefers-reduced-motion`.

### Don't:
- **Don't** look like **SAP GUI / classic SAP**: no grey form walls, no cryptic transaction codes, no dated bevelled chrome.
- **Don't** look like a **generic SaaS admin**: no left sidebar plus stat-card grid plus chart template as a home screen.
- **Don't** look like **Odoo or a typical web ERP**: no busy pages and no form-after-form navigation that throws away the user's context; open another window instead.
- **Don't** ship **over-styled glass UI**: no blur behind data, no gradients, no glow (The OS-Only Translucency Rule).
- **Don't** use side-stripe borders thicker than 1px as accents, gradient text, uppercase eyebrows, or identical card grids.
- **Don't** use modals as a first answer; prefer inline editing, a side panel or a new window.
