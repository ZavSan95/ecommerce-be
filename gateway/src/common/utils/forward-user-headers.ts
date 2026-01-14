import { Request } from 'express';
import { RequestUser } from '../../interfaces/request-user.interface';

export function forwardUserHeaders(req: Request) {
  const user = req.user as RequestUser;

  if (!user) return {};

  return {
    'x-user-id': user.userId,
    'x-user-email': user.email,
    'x-user-roles': user.roles?.join(',') ?? '',
    'x-user-permissions': user.permissions?.join(',') ?? '',
  };
}
