import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Injects the authenticated user (as attached by JwtStrategy.validate) into a handler.
 * `@CurrentUser()` → the whole user object; `@CurrentUser('id')` → a single field.
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const req = ctx.switchToHttp().getRequest();
    return data ? req.user?.[data] : req.user;
  },
);
