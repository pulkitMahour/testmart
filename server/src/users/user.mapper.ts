import { UserDocument } from './schemas/user.schema';

/** Safe user projection returned to clients — never includes the password hash. */
export function toUserResponse(user: UserDocument) {
  return {
    id: String(user._id),
    name: user.name,
    email: user.email,
    role: user.role,
    address: user.address || {},
    createdAt: (user as any).createdAt,
  };
}

export type UserResponse = ReturnType<typeof toUserResponse>;
