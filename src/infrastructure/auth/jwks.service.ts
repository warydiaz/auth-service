import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createPublicKey, createHash } from 'crypto';

@Injectable()
export class JwksService {
  constructor(private readonly config: ConfigService) {}

  getJwks() {
    const publicKeyPem = this.config.getOrThrow<string>('JWT_PUBLIC_KEY');
    const keyObject = createPublicKey(publicKeyPem);
    const jwk = keyObject.export({ format: 'jwk' }) as Record<string, string>;

    const kid = createHash('sha256')
      .update(publicKeyPem)
      .digest('base64url')
      .slice(0, 16);

    return {
      keys: [{ ...jwk, use: 'sig', alg: 'RS256', kid }],
    };
  }
}
