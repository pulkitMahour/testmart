import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/** Guards a route by running the Passport 'jwt' strategy (reads token from the cookie). */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
