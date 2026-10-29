import type { IncomingHttpHeaders } from 'node:http';

export type MachineCredentials =
  | { readonly scheme: 'basic'; readonly clientId: string; readonly clientSecret: string }
  | { readonly scheme: 'bearer' | 'api-key-header'; readonly token: string };

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export function decodeBasicCredentials(encoded: string): { clientId: string; clientSecret: string } {
  const decoded = Buffer.from(encoded, 'base64').toString('utf8');
  const separator = decoded.indexOf(':');

  if (separator < 0) return { clientId: decoded, clientSecret: '' };

  return { clientId: decoded.slice(0, separator), clientSecret: decoded.slice(separator + 1) };
}

// Authorization wins when both it and X-Api-Key are present.
export function readMachineCredentials(headers: IncomingHttpHeaders): MachineCredentials | null {
  const apiKeyHeader = single(headers['x-api-key'])?.trim();
  const authorization = single(headers.authorization)?.trim();

  if (authorization) {
    const [scheme = '', ...rest] = authorization.split(/\s+/);
    const value = rest.join(' ');

    if (scheme.toLowerCase() === 'basic') return { scheme: 'basic', ...decodeBasicCredentials(value) };
    if (scheme.toLowerCase() === 'bearer') return { scheme: 'bearer', token: value };
  }

  if (apiKeyHeader) return { scheme: 'api-key-header', token: apiKeyHeader };

  return null;
}
