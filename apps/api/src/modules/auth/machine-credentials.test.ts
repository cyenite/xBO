import { describe, expect, it } from 'vitest';
import { readMachineCredentials } from './machine-credentials';

const basic = (value: string) => `Basic ${Buffer.from(value).toString('base64')}`;

describe('readMachineCredentials', () => {
  it('reads basic credentials, keeping colons inside the secret', () => {
    expect(readMachineCredentials({ authorization: basic('client:se:cret') })).toEqual({ scheme: 'basic', clientId: 'client', clientSecret: 'se:cret' });
  });

  it('reads bearer tokens case-insensitively', () => {
    expect(readMachineCredentials({ authorization: 'bearer abc' })).toEqual({ scheme: 'bearer', token: 'abc' });
  });

  it('reads the X-Api-Key header', () => {
    expect(readMachineCredentials({ 'x-api-key': 'abc' })).toEqual({ scheme: 'api-key-header', token: 'abc' });
  });

  it('ignores requests without machine credentials', () => {
    expect(readMachineCredentials({ cookie: 'xbo_session=abc' })).toBeNull();
    expect(readMachineCredentials({ authorization: 'Digest abc' })).toBeNull();
  });
});
