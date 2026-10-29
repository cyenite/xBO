import { adjustForContrast, contrastRatio, formatOklch, parseColor, toGamut, type Oklch } from './color';

export const themeTokens = [
  { name: 'desktop', kind: 'tinted' },
  { name: 'window', kind: 'tinted' },
  { name: 'chrome', kind: 'tinted' },
  { name: 'raised', kind: 'tinted' },
  { name: 'hover', kind: 'tinted' },
  { name: 'pressed', kind: 'tinted' },
  { name: 'hairline', kind: 'tinted' },
  { name: 'field-border', kind: 'tinted' },
  { name: 'ink', kind: 'tinted' },
  { name: 'ink-muted', kind: 'tinted' },
  { name: 'ink-subtle', kind: 'tinted' },
  { name: 'primary', kind: 'accent' },
  { name: 'primary-hover', kind: 'accent' },
  { name: 'primary-soft', kind: 'accent' },
  { name: 'on-primary', kind: 'accent' },
  { name: 'focus', kind: 'accent' },
  { name: 'danger', kind: 'fixed' },
  { name: 'danger-soft', kind: 'fixed' },
  { name: 'warning', kind: 'fixed' },
  { name: 'warning-fill', kind: 'fixed' },
  { name: 'warning-soft', kind: 'fixed' },
  { name: 'success', kind: 'fixed' },
  { name: 'success-soft', kind: 'fixed' },
  { name: 'traffic-close', kind: 'fixed' },
  { name: 'traffic-minimize', kind: 'fixed' },
  { name: 'traffic-zoom', kind: 'fixed' },
  { name: 'traffic-idle', kind: 'tinted' },
  { name: 'caption-close', kind: 'fixed' },
] as const;

export type ThemeTokenName = (typeof themeTokens)[number]['name'];
export type ThemeTokens = Record<ThemeTokenName, string>;
export type ThemeMode = 'light' | 'dark';

export const themePresets = [
  { value: 'harbour', label: 'Harbour', accent: 'oklch(0.49 0.095 207)' },
  { value: 'ocean', label: 'Ocean', accent: 'oklch(0.5 0.13 250)' },
  { value: 'indigo', label: 'Indigo', accent: 'oklch(0.5 0.15 275)' },
  { value: 'violet', label: 'Violet', accent: 'oklch(0.52 0.15 300)' },
  { value: 'rose', label: 'Rose', accent: 'oklch(0.55 0.17 10)' },
  { value: 'ember', label: 'Ember', accent: 'oklch(0.6 0.14 55)' },
  { value: 'forest', label: 'Forest', accent: 'oklch(0.5 0.11 155)' },
  { value: 'graphite', label: 'Graphite', accent: 'oklch(0.45 0.02 250)' },
] as const;

export type ThemePresetId = (typeof themePresets)[number]['value'];

export const radiusScales = [
  { value: 'sharp', label: 'Sharp', xs: 2, sm: 3, md: 4, lg: 5, xl: 7 },
  { value: 'default', label: 'Default', xs: 4, sm: 6, md: 8, lg: 10, xl: 14 },
  { value: 'round', label: 'Round', xs: 6, sm: 9, md: 12, lg: 14, xl: 20 },
] as const;

export type RadiusScaleId = (typeof radiusScales)[number]['value'];
export type RadiusStep = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ThemeFonts {
  sans: string;
  mono: string;
}

export interface ThemeOptions {
  dark?: Partial<ThemeTokens>;
  light?: Partial<ThemeTokens>;
  fonts?: Partial<ThemeFonts>;
  accent?: string;
  preset?: ThemePresetId;
  radius?: RadiusScaleId | Record<RadiusStep, number>;
}

export interface ResolvedTheme {
  dark: ThemeTokens;
  light: ThemeTokens;
  fonts: ThemeFonts;
  radii: Record<RadiusStep, number>;
  darkContrast: ThemeTokens;
  lightContrast: ThemeTokens;
}

export const defaultFonts: ThemeFonts = {
  sans: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI Variable Text', 'Segoe UI', system-ui, 'Noto Sans', Ubuntu, Cantarell, sans-serif",
  mono: "ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace",
};

// The hand-tuned Harbour palette from DESIGN.md; other accents are derived from it.
export const baseLightTokens: ThemeTokens = {
  desktop: 'oklch(0.915 0.022 205)',
  window: 'oklch(1 0 0)',
  chrome: 'oklch(0.972 0.004 215)',
  raised: 'oklch(0.985 0.002 215)',
  hover: 'oklch(0.955 0.005 215)',
  pressed: 'oklch(0.93 0.006 215)',
  hairline: 'oklch(0.905 0.006 215)',
  'field-border': 'oklch(0.64 0.01 215)',
  ink: 'oklch(0.235 0.014 225)',
  'ink-muted': 'oklch(0.47 0.014 225)',
  'ink-subtle': 'oklch(0.535 0.012 225)',
  primary: 'oklch(0.49 0.095 207)',
  'primary-hover': 'oklch(0.44 0.095 207)',
  'primary-soft': 'oklch(0.945 0.028 205)',
  'on-primary': 'oklch(1 0 0)',
  focus: 'oklch(0.6 0.12 205)',
  danger: 'oklch(0.53 0.19 27)',
  'danger-soft': 'oklch(0.955 0.025 27)',
  warning: 'oklch(0.53 0.12 65)',
  'warning-fill': 'oklch(0.8 0.14 80)',
  'warning-soft': 'oklch(0.965 0.035 85)',
  success: 'oklch(0.52 0.12 155)',
  'success-soft': 'oklch(0.955 0.03 155)',
  'traffic-close': 'oklch(0.66 0.2 27)',
  'traffic-minimize': 'oklch(0.82 0.16 85)',
  'traffic-zoom': 'oklch(0.72 0.17 145)',
  'traffic-idle': 'oklch(0.86 0.004 215)',
  'caption-close': 'oklch(0.55 0.21 27)',
};

export const baseDarkTokens: ThemeTokens = {
  ...baseLightTokens,
  desktop: 'oklch(0.165 0.014 215)',
  window: 'oklch(0.215 0.009 225)',
  chrome: 'oklch(0.19 0.009 225)',
  raised: 'oklch(0.245 0.009 225)',
  hover: 'oklch(0.27 0.009 225)',
  pressed: 'oklch(0.3 0.01 225)',
  hairline: 'oklch(0.31 0.009 225)',
  'field-border': 'oklch(0.52 0.01 225)',
  ink: 'oklch(0.945 0.005 225)',
  'ink-muted': 'oklch(0.74 0.011 225)',
  'ink-subtle': 'oklch(0.66 0.011 225)',
  primary: 'oklch(0.74 0.105 200)',
  'primary-hover': 'oklch(0.79 0.1 200)',
  'primary-soft': 'oklch(0.32 0.045 205)',
  'on-primary': 'oklch(0.18 0.02 210)',
  focus: 'oklch(0.74 0.12 200)',
  danger: 'oklch(0.7 0.17 25)',
  'danger-soft': 'oklch(0.3 0.06 25)',
  warning: 'oklch(0.8 0.13 75)',
  'warning-fill': 'oklch(0.8 0.13 75)',
  'warning-soft': 'oklch(0.31 0.05 75)',
  success: 'oklch(0.74 0.13 155)',
  'success-soft': 'oklch(0.3 0.05 155)',
  'traffic-idle': 'oklch(0.38 0.008 225)',
};

const baseAccentHue = 207;
const baseAccentChroma = 0.095;
const minimumTextContrast = 4.5;

function tint(token: string, hueShift: number, chromaScale: number): string {
  const color = parseColor(token);

  return formatOklch({ l: color.l, c: color.c * chromaScale, h: (color.h + hueShift + 360) % 360 });
}

function deriveTokens(base: ThemeTokens, accent: Oklch, mode: ThemeMode): ThemeTokens {
  const hueShift = accent.h - baseAccentHue;
  const chromaScale = Math.min(1.4, Math.max(0.25, accent.c / baseAccentChroma));
  const tokens = { ...base };

  for (const token of themeTokens) {
    if (token.kind === 'tinted') tokens[token.name] = tint(base[token.name], hueShift, chromaScale);
  }

  const window = parseColor(tokens.window);
  const hue = accent.h;

  if (mode === 'light') {
    const soft = toGamut({ l: 0.945, c: Math.min(0.03, accent.c * 0.3), h: hue });
    const primary = adjustForContrast({ ...accent, l: Math.min(accent.l, 0.62) }, [window, soft], minimumTextContrast, 'darker');

    return {
      ...tokens,
      primary: formatOklch(primary),
      'primary-hover': formatOklch(toGamut({ ...primary, l: primary.l - 0.05 })),
      'primary-soft': formatOklch(soft),
      'on-primary': 'oklch(1 0 0)',
      focus: formatOklch(toGamut({ l: 0.6, c: Math.min(0.13, accent.c + 0.025), h: hue })),
    };
  }

  const soft = toGamut({ l: 0.32, c: Math.min(0.05, accent.c * 0.45), h: hue });
  const onPrimary = toGamut({ l: 0.18, c: Math.min(0.02, accent.c * 0.2), h: hue });
  const primary = adjustForContrast(
    { l: Math.max(accent.l, 0.72), c: Math.min(0.16, accent.c + 0.01), h: hue },
    [window, soft, onPrimary],
    minimumTextContrast,
    'lighter',
  );

  return {
    ...tokens,
    primary: formatOklch(primary),
    'primary-hover': formatOklch(toGamut({ ...primary, l: Math.min(0.95, primary.l + 0.05) })),
    'primary-soft': formatOklch(soft),
    'on-primary': formatOklch(onPrimary),
    focus: formatOklch(toGamut({ l: 0.74, c: Math.min(0.13, accent.c + 0.025), h: hue })),
  };
}

function withHigherContrast(tokens: ThemeTokens, mode: ThemeMode): ThemeTokens {
  const hue = parseColor(tokens.ink).h;

  if (mode === 'light') {
    return {
      ...tokens,
      ink: 'oklch(0.12 0 0)',
      'ink-muted': formatOklch({ l: 0.3, c: 0.012, h: hue }),
      'ink-subtle': formatOklch({ l: 0.34, c: 0.012, h: hue }),
      hairline: formatOklch({ l: 0.55, c: 0.01, h: hue }),
      'field-border': formatOklch({ l: 0.35, c: 0.01, h: hue }),
    };
  }

  return {
    ...tokens,
    ink: 'oklch(1 0 0)',
    'ink-muted': formatOklch({ l: 0.88, c: 0.008, h: hue }),
    'ink-subtle': formatOklch({ l: 0.84, c: 0.008, h: hue }),
    hairline: formatOklch({ l: 0.55, c: 0.01, h: hue }),
    'field-border': formatOklch({ l: 0.75, c: 0.01, h: hue }),
  };
}

export function presetAccent(preset: ThemePresetId): string {
  return themePresets.find((candidate) => candidate.value === preset)?.accent ?? themePresets[0].accent;
}

export function resolveRadii(radius: ThemeOptions['radius'] = 'default'): Record<RadiusStep, number> {
  if (typeof radius === 'object') return radius;

  const scale = radiusScales.find((candidate) => candidate.value === radius) ?? radiusScales[1];

  return { xs: scale.xs, sm: scale.sm, md: scale.md, lg: scale.lg, xl: scale.xl };
}

// The untouched Harbour preset keeps the hand-tuned palette exactly; any other accent is derived and contrast-checked.
export function createTheme(options: ThemeOptions = {}): ResolvedTheme {
  const accentInput = options.accent ?? presetAccent(options.preset ?? 'harbour');
  const isBasePalette = options.accent === undefined && (options.preset ?? 'harbour') === 'harbour';
  const accent = toGamut(parseColor(accentInput));
  const light = { ...(isBasePalette ? baseLightTokens : deriveTokens(baseLightTokens, accent, 'light')), ...options.light };
  const dark = { ...(isBasePalette ? baseDarkTokens : deriveTokens(baseDarkTokens, accent, 'dark')), ...options.dark };

  return {
    dark,
    light,
    fonts: { ...defaultFonts, ...options.fonts },
    radii: resolveRadii(options.radius),
    darkContrast: withHigherContrast(dark, 'dark'),
    lightContrast: withHigherContrast(light, 'light'),
  };
}

export function tokenContrast(tokens: ThemeTokens, foreground: ThemeTokenName, background: ThemeTokenName): number {
  return contrastRatio(parseColor(tokens[foreground]), parseColor(tokens[background]));
}

function declarations(tokens: ThemeTokens): string {
  return themeTokens.map((token) => `--xbo-${token.name}: ${tokens[token.name]};`).join(' ');
}

// Mode and contrast are attributes on the scope element, so one stylesheet serves every combination without JavaScript.
export function themeToCss(theme: ResolvedTheme, scope: string): string {
  const radii = (Object.entries(theme.radii) as [RadiusStep, number][]).map(([step, value]) => `--xbo-radius-${step}: ${value}px;`).join(' ');
  const fonts = `--xbo-font-sans: ${theme.fonts.sans}; --xbo-font-mono: ${theme.fonts.mono};`;

  return [
    `${scope} { ${declarations(theme.light)} ${radii} ${fonts} }`,
    `${scope}[data-xbo-mode='dark'] { ${declarations(theme.dark)} }`,
    `${scope}[data-xbo-contrast='more'] { ${declarations(theme.lightContrast)} }`,
    `${scope}[data-xbo-mode='dark'][data-xbo-contrast='more'] { ${declarations(theme.darkContrast)} }`,
  ].join('\n');
}
