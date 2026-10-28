import { BadRequestException, Body, Controller, Header, Headers, HttpCode, Post, UnauthorizedException } from '@nestjs/common';
import {
  clientCredentialsTokenRequestSchema,
  passwordTokenRequestSchema,
  type AccessTokenResponse,
  type PasswordTokenRequest,
  type PasswordTokenResponse,
} from '@xbo/contracts';
import { ZodValidationPipe } from '../../common/zod-validation.pipe';
import { Public } from './auth.decorators';
import { MachineAuthService } from './machine-auth.service';
import { decodeBasicCredentials } from './machine-credentials';

// Token endpoints for integration clients: OAuth 2 client credentials, and a username / password login for clients that cannot do OAuth.
@Public()
@Controller('auth')
export class TokenController {
  constructor(private readonly machineAuth: MachineAuthService) {}

  // Accepts JSON and form bodies; extras some clients add (`resource`, `scope`, a capitalised `Scope`, `client_name`) are ignored.
  @Post('oauth/token')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  async issueClientCredentialsToken(@Body() body: unknown, @Headers('authorization') authorization?: string): Promise<AccessTokenResponse> {
    const parsed = clientCredentialsTokenRequestSchema.safeParse(body ?? {});

    if (!parsed.success) {
      const grantType = typeof body === 'object' && body !== null && 'grant_type' in body ? body.grant_type : undefined;
      const error = grantType !== undefined && grantType !== 'client_credentials' ? 'unsupported_grant_type' : 'invalid_request';

      throw new BadRequestException({ error });
    }

    const basic = authorization?.toLowerCase().startsWith('basic ') ? decodeBasicCredentials(authorization.slice(6).trim()) : undefined;
    const clientId = parsed.data.client_id ?? basic?.clientId;
    const clientSecret = parsed.data.client_secret ?? basic?.clientSecret;
    const client = clientId && clientSecret ? await this.machineAuth.authenticateClient(clientId, clientSecret) : null;

    if (!client) throw new UnauthorizedException({ error: 'invalid_client' });

    const issued = this.machineAuth.issueAccessToken(client);

    return { token_type: 'Bearer', expires_in: issued.expiresIn, access_token: issued.token };
  }

  // Takes `{username, password}` as JSON and answers with `token`, the shape simple token-login clients expect.
  @Post('token')
  @HttpCode(200)
  @Header('Cache-Control', 'no-store')
  async issuePasswordToken(@Body(new ZodValidationPipe(passwordTokenRequestSchema)) body: PasswordTokenRequest): Promise<PasswordTokenResponse> {
    const client = await this.machineAuth.authenticateClient(body.username, body.password);

    if (!client) throw new UnauthorizedException('The username or password is incorrect.');

    const issued = this.machineAuth.issueAccessToken(client);

    return { token: issued.token, token_type: 'Bearer', expires_in: issued.expiresIn };
  }
}
