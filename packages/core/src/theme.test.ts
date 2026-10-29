import { describe, expect, it } from 'vitest';
import { contrastRatio, formatHex, parseColor } from './color';
import { baseDarkTokens, baseLightTokens, createTheme, themePresets, themeToCss, tokenContrast } from './theme';

describe('colour maths', () => {
  it('round-trips hex through OKLCH', () => {
    for (const hex of ['#ffffff', '#000000', '#1f7a80', '#c0392b']) expect(formatHex(parseColor(hex))).toBe(hex);
  });

  it('computes WCAG contrast ratios', () => {
    expect(contrastRatio(parseColor('#000000'), parseColor('#ffffff'))).toBeCloseTo(21, 0);
    expect(contrastRatio(parseColor('#777777'), parseColor('#ffffff'))).toBeCloseTo(4.48, 1);
  });

  it('rejects colours it cannot read', () => {
    expect(() => parseColor('teal')).toThrow(/Unsupported colour/);
  });
});

describe('themes', () => {
  it('keeps the hand-tuned Harbour palette exactly', () => {
    const theme = createTheme();

    expect(theme.light).toEqual(baseLightTokens);
    expect(theme.dark).toEqual(baseDarkTokens);
  });

  it.each(themePresets.map((preset) => preset.value))('meets text contrast for the %s preset in both modes', (preset) => {
    const theme = createTheme({ preset });

    for (const tokens of [theme.light, theme.dark]) {
      expect(tokenContrast(tokens, 'primary', 'window')).toBeGreaterThanOrEqual(4.5);
      expect(tokenContrast(tokens, 'on-primary', 'primary')).toBeGreaterThanOrEqual(4.5);
      expect(tokenContrast(tokens, 'primary', 'primary-soft')).toBeGreaterThanOrEqual(4.5);
      expect(tokenContrast(tokens, 'ink', 'window')).toBeGreaterThanOrEqual(4.5);
      expect(tokenContrast(tokens, 'ink-muted', 'chrome')).toBeGreaterThanOrEqual(4.5);
    }
  });

  it('darkens a pale custom accent until it is readable', () => {
    const theme = createTheme({ accent: '#7fd6ff' });

    expect(tokenContrast(theme.light, 'primary', 'window')).toBeGreaterThanOrEqual(4.5);
  });

  it('applies token overrides after derivation', () => {
    expect(createTheme({ preset: 'rose', light: { desktop: '#eeeeee' } }).light.desktop).toBe('#eeeeee');
  });

  it('raises contrast in the increased-contrast variants', () => {
    const theme = createTheme();

    expect(tokenContrast(theme.lightContrast, 'ink-muted', 'window')).toBeGreaterThan(tokenContrast(theme.light, 'ink-muted', 'window'));
    expect(tokenContrast(theme.darkContrast, 'hairline', 'window')).toBeGreaterThan(tokenContrast(theme.dark, 'hairline', 'window'));
  });

  it('writes CSS for every mode and contrast combination under one scope', () => {
    const css = themeToCss(createTheme({ radius: 'round' }), '.xbo-desktop');

    expect(css).toContain(".xbo-desktop[data-xbo-mode='dark'][data-xbo-contrast='more']");
    expect(css).toContain('--xbo-radius-md: 12px;');
    expect(css).toContain('--xbo-primary:');
  });
});
