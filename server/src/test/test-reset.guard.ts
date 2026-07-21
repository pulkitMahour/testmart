import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';

/**
 * Gates POST /api/test/reset.
 * - Disabled unless ENABLE_TEST_RESET=true — throws 404 so the route is invisible on a
 *   public deploy (leave the flag unset on Render).
 * - If TEST_RESET_TOKEN is set, an `x-test-reset-token` header must match it.
 */
@Injectable()
export class TestResetGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    if (process.env.ENABLE_TEST_RESET !== 'true') {
      throw new NotFoundException();
    }
    const token = process.env.TEST_RESET_TOKEN;
    if (token) {
      const req = ctx.switchToHttp().getRequest();
      if (req.headers['x-test-reset-token'] !== token) {
        throw new UnauthorizedException('Invalid test reset token');
      }
    }
    return true;
  }
}
