import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from './auth.service';
import { passportJwtSecret } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
// import { AuthConfig } from './auth.config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly authService: AuthService,
    private configService: ConfigService,
  ) {
    super({
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `${configService.get<string>('authority')}/.well-known/jwks.json`,
      }),

      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      audience: configService.get<string>('clientId'),
      issuer: configService.get<string>('authority'),
      algorithms: ['RS256'],
    });
  }

  public async validate(payload: any) {
    // return !!payload.sub;
    return payload;
  }
}
