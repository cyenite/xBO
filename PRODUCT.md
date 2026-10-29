# Product

## Register

product

## Users

Two audiences, in this order:

- **Developers** building business and productivity software that people live in all day: back offices, admin consoles, internal tools, data-heavy line-of-business apps. They want a desktop-grade shell (windows, menus, taskbar, command palette, keyboard everything, settings, theming) without building one, and they want it to run in the browser and as a native app through Tauri from one codebase.
- **The people who use those apps**: clerks, analysts, operators, managers. They keep several records open at once, work from the keyboard, and spend hours a day in the software. Seconds per task add up; so does eye strain.

## Product Purpose

xBO is an open-source framework for building desktop-style applications for the web and Tauri. Developers register their apps (Vue components) with one `createXbo()` call and get a complete desktop: windows that drag, resize, snap and remember where they were; a menu bar that follows the focused app; a taskbar; a Start launcher; a command palette; notifications; dialogs and window-modal sheets; a Settings app users can change appearance, accent, contrast, density, text size, wallpaper, window controls and keyboard shortcuts in; and a component kit (data grid, forms, lists, trees, tabs, split views, overlays) that follows the same theme.

Everything is configurable: brand, apps and groups, menus, status items, shortcuts, theme and tokens, preference defaults (and which ones are locked or hidden), storage, startup windows, routing and language.

Success: a developer has a credible desktop app running in an afternoon, and its users believe it was built by a large, careful team.

## Brand Personality

**Precise, calm, trustworthy.**

- Voice: plain, exact, unhurried. Labels say what things are; messages say what happened and what to do next.
- Feel: native OS-grade, as if Apple or Microsoft had built a web framework. Restrained, quietly confident, nothing decorative.
- Developer experience: one obvious way to do each thing, typed end to end, sensible defaults, every default overridable.

References and what to take from each:
- **macOS apps (Finder, Mail):** the menu bar, toolbars and sidebars, keyboard-first operation, pixel-level precision.
- **Windows 11 (Settings, Explorer):** Fluent materials used with restraint, snap layouts, the centred taskbar, clear typographic hierarchy.
- **Linear:** speed, the command palette, keyboard shortcuts everywhere, restraint in colour.
- **Bloomberg / Excel:** information density and grid editing that experts trust.

## Anti-references

- **SAP GUI / classic SAP:** grey forms, cryptic transaction codes, dated chrome, modal walls.
- **Generic SaaS admin:** the sidebar + stat cards + charts template every startup ships.
- **Odoo and typical web ERPs:** busy pages, inconsistent screens, form-after-form navigation that loses context.
- **Over-styled glass UI:** heavy blur, gradients and effects that hurt readability. Translucency is allowed only where the OS itself uses it (menu bar, taskbar, popovers), and never behind data.

## Design Principles

1. **The desktop is the workspace.** Several documents live side by side in windows; nothing important hides behind navigation that throws away context.
2. **Density with clarity.** Show more data per screen than a web app would, but every column, label and number stays legible and aligned.
3. **Keyboard first, mouse welcome.** Every action has a shortcut and a palette entry; users can rebind shortcuts.
4. **Calm by default, loud only when it matters.** Colour signals state, never decoration.
5. **Configurable without forking.** Anything a developer might reasonably want to change is a config option, a slot, a registry or a token.
6. **The host page is not ours.** No global resets, no leaked class names; the desktop can run fullscreen or embedded.

## Accessibility & Inclusion

- **WCAG 2.2 AA** across web and desktop: full keyboard operation, visible focus, 4.5:1 text contrast (checked automatically for derived accents), target sizes, screen-reader names for every control.
- User settings for appearance, increased contrast, reduced transparency, reduced motion, density and text size (90 to 130%), each following the system by default where the system has a setting.
- Status is never colour-only: pair colour with icon and text.
- Every built-in string is translatable.
