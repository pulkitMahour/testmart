import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { UsersService } from '../users/users.service';
import { toUserResponse } from '../users/user.mapper';

/** Pulls the JWT out of the httpOnly `token` cookie. */
const cookieExtractor = (req: Request): string | null => req?.cookies?.token ?? null;

interface JwtPayload {
  sub: string;
  role: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly users: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor]),
      secretOrKey: process.env.JWT_SECRET || 'dev_secret',
      ignoreExpiration: false,
    });
  }

  // The return value becomes `req.user` on guarded routes.
  async validate(payload: JwtPayload) {
    const user = await this.users.findById(payload.sub);
    if (!user) throw new UnauthorizedException('User no longer exists');
    return toUserResponse(user);
  }
}
