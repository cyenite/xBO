// Exact decimal handling for NumberField: values stay strings end to end, so 0.1 + 0.2 never becomes 0.30000000000000004.
const decimalPattern = /^-?\d*(\.\d*)?$/;

export function isDecimalInput(value: string): boolean {
  return decimalPattern.test(value);
}

function toScaled(value: string, scale: number): bigint {
  const isNegative = value.startsWith('-');
  const [whole = '0', fraction = ''] = value.replace('-', '').split('.');
  const digits = `${whole || '0'}${fraction.padEnd(scale, '0').slice(0, scale)}`;
  const scaled = BigInt(digits);

  return isNegative ? -scaled : scaled;
}

function fromScaled(scaled: bigint, scale: number): string {
  const isNegative = scaled < 0n;
  const digits = (isNegative ? -scaled : scaled).toString().padStart(scale + 1, '0');
  const whole = digits.slice(0, digits.length - scale);
  const fraction = scale > 0 ? `.${digits.slice(-scale)}` : '';

  return `${isNegative && scaled !== 0n ? '-' : ''}${whole}${fraction}`;
}

// Rounds half away from zero to `scale` places.
export function normalizeDecimal(value: string, scale: number): string {
  if (value === '' || value === '-' || value === '.') return '';

  const extra = toScaled(value, scale + 1);
  const remainder = extra % 10n;
  const rounded = extra / 10n + (remainder >= 5n ? 1n : remainder <= -5n ? -1n : 0n);

  return fromScaled(rounded, scale);
}

export function addDecimal(value: string, step: string, scale: number): string {
  return fromScaled(toScaled(value === '' ? '0' : value, scale) + toScaled(step, scale), scale);
}

export function compareDecimal(left: string, right: string, scale: number): number {
  const difference = toScaled(left, scale) - toScaled(right, scale);

  return difference === 0n ? 0 : difference < 0n ? -1 : 1;
}
