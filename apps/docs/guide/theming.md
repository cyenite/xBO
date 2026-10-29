# Theming

Every colour, radius and font is a `--xbo-*` custom property on the desktop root, written at runtime for light, dark and increased-contrast modes.

```ts
createXbo({
  apps,
  theme: {
    accent: '#7c3aed',              // any hex or oklch() colour
    radius: 'round',                // sharp, default, round, or { xs, sm, md, lg, xl } in px
    fonts: { sans: 'Inter, system-ui, sans-serif' },
    light: { desktop: '#eef1f6' },  // override any token
    dark: { desktop: '#0b0f17' },
  },
});
```

- **Presets**: Harbour (default), Ocean, Indigo, Violet, Rose, Ember, Forest, Graphite. Users pick one in Settings; "Brand colour" is yours.
- **Derived accents are contrast-checked**: the primary colour is adjusted until text and selections reach 4.5:1 in both modes.
- **Increased contrast** darkens text and borders and turns translucency off.

<DemoDesktop demo="components" preset="violet" height="480px" />

## Tokens

`desktop`, `window`, `chrome`, `raised`, `hover`, `pressed`, `hairline`, `field-border`, `ink`, `ink-muted`, `ink-subtle`, `primary`, `primary-hover`, `primary-soft`, `on-primary`, `focus`, `danger`, `danger-soft`, `warning`, `warning-fill`, `warning-soft`, `success`, `success-soft`, the window control colours, plus `--xbo-radius-*` and `--xbo-font-sans` / `--xbo-font-mono`.

Use them in your own components: `color: var(--xbo-ink-muted)`.

## Tailwind

```css
@import 'tailwindcss';
@import '@xbo-ui/vue/tailwind.css';
```

Then `bg-window`, `text-ink-muted`, `ring-hairline`, `rounded-md`, `text-body` and `shadow-popover` follow the user's theme and text size.

## The host page

The library stylesheet uses prefixed utilities and no global reset, so it never restyles the rest of your page or collides with your own Tailwind.
