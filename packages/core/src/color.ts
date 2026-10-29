export interface Oklch {
  l: number;
  c: number;
  h: number;
}

export interface Rgb {
  r: number;
  g: number;
  b: number;
}

const oklchPattern = /^oklch\(\s*([\d.]+)(%?)\s+([\d.]+)\s+([\d.]+)(?:deg)?\s*(?:\/\s*[\d.%]+\s*)?\)$/i;
const hexPattern = /^#?([\da-f]{3}|[\da-f]{6})$/i;

function toLinear(channel: number): number {
  return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
}

function toGamma(channel: number): number {
  return channel <= 0.0031308 ? 12.92 * channel : 1.055 * channel ** (1 / 2.4) - 0.055;
}

// Conversions follow Björn Ottosson's OKLab definition (https://bottosson.github.io/posts/oklab/).
export function rgbToOklch({ r, g, b }: Rgb): Oklch {
  const lr = toLinear(r);
  const lg = toLinear(g);
  const lb = toLinear(b);
  const l = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const lightness = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bAxis = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const chroma = Math.hypot(a, bAxis);
  const hue = chroma < 1e-6 ? 0 : ((Math.atan2(bAxis, a) * 180) / Math.PI + 360) % 360;

  return { l: lightness, c: chroma, h: hue };
}

// Returns linear-light channels before gamma, unclamped, so callers can test whether a colour is inside sRGB.
function oklchToLinearRgb({ l, c, h }: Oklch): Rgb {
  const radians = (h * Math.PI) / 180;
  const a = c * Math.cos(radians);
  const b = c * Math.sin(radians);
  const lp = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const mp = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const sp = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;

  return {
    r: 4.0767416621 * lp - 3.3077115913 * mp + 0.2309699292 * sp,
    g: -1.2684380046 * lp + 2.6097574011 * mp - 0.3413193965 * sp,
    b: -0.0041960863 * lp - 0.7034186147 * mp + 1.707614701 * sp,
  };
}

function isInGamut(linear: Rgb): boolean {
  const tolerance = 1e-4;

  return [linear.r, linear.g, linear.b].every((channel) => channel >= -tolerance && channel <= 1 + tolerance);
}

// Lowers chroma until the colour fits sRGB, keeping lightness and hue: the perceptual intent survives.
export function toGamut(color: Oklch): Oklch {
  if (isInGamut(oklchToLinearRgb(color))) return color;

  let low = 0;
  let high = color.c;

  for (let step = 0; step < 24; step += 1) {
    const middle = (low + high) / 2;

    if (isInGamut(oklchToLinearRgb({ ...color, c: middle }))) low = middle;
    else high = middle;
  }

  return { ...color, c: low };
}

export function oklchToRgb(color: Oklch): Rgb {
  const linear = oklchToLinearRgb(toGamut(color));
  const clamp = (channel: number) => Math.min(1, Math.max(0, toGamma(Math.min(1, Math.max(0, channel)))));

  return { r: clamp(linear.r), g: clamp(linear.g), b: clamp(linear.b) };
}

export function parseColor(input: string): Oklch {
  const value = input.trim();
  const oklch = oklchPattern.exec(value);

  if (oklch) {
    const lightness = Number(oklch[1]) / (oklch[2] === '%' ? 100 : 1);

    return { l: lightness, c: Number(oklch[3]), h: Number(oklch[4]) };
  }

  const hex = hexPattern.exec(value);

  if (!hex) throw new Error(`Unsupported colour "${input}": use #rgb, #rrggbb or oklch(L C H).`);

  const digits = hex[1] ?? '';
  const full = digits.length === 3 ? digits.replace(/./g, (digit) => digit + digit) : digits;
  const channel = (offset: number) => parseInt(full.slice(offset, offset + 2), 16) / 255;

  return rgbToOklch({ r: channel(0), g: channel(2), b: channel(4) });
}

export function formatOklch({ l, c, h }: Oklch): string {
  const round = (value: number, digits: number) => Number(value.toFixed(digits));

  return `oklch(${round(l, 3)} ${round(c, 3)} ${round(h, 1)})`;
}

export function formatHex(color: Oklch): string {
  const { r, g, b } = oklchToRgb(color);

  return `#${[r, g, b].map((channel) => Math.round(channel * 255).toString(16).padStart(2, '0')).join('')}`;
}

export function relativeLuminance(color: Oklch): number {
  const { r, g, b } = oklchToRgb(color);

  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function contrastRatio(foreground: Oklch, background: Oklch): number {
  const lighter = Math.max(relativeLuminance(foreground), relativeLuminance(background));
  const darker = Math.min(relativeLuminance(foreground), relativeLuminance(background));

  return (lighter + 0.05) / (darker + 0.05);
}

// Moves lightness in the given direction in small steps until every pairing reaches the target ratio.
export function adjustForContrast(color: Oklch, against: Oklch[], target: number, direction: 'darker' | 'lighter'): Oklch {
  let candidate = toGamut(color);
  const step = direction === 'darker' ? -0.005 : 0.005;

  while (against.some((other) => contrastRatio(candidate, other) < target) && candidate.l > 0.02 && candidate.l < 0.98) {
    candidate = toGamut({ ...candidate, l: candidate.l + step });
  }

  return candidate;
}
