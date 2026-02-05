import { UnauthorizedException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Request, Response } from 'express';

export async function getAuthenticatedUser(
  req: Request,
  res: Response,
  natsClient: ClientProxy,
) {
  const accessToken = req.cookies?.access_token;
  const refreshToken = req.cookies?.refresh_token;

  if (!accessToken && !refreshToken) {
    throw new UnauthorizedException();
  }

  try {
    // 1️⃣ Intentamos validar access token
    return await firstValueFrom(
      natsClient.send('auth.me', { accessToken }),
    );
  } catch {
    // 2️⃣ Access inválido → intentamos refresh
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    try {
      const refreshResult = await firstValueFrom(
        natsClient.send('auth.refresh', { refreshToken }),
      );

      // 3️⃣ Setear nuevas cookies
      res.cookie('access_token', refreshResult.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refresh_token', refreshResult.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      // 4️⃣ Volvemos a pedir el user
      return await firstValueFrom(
        natsClient.send('auth.me', {
          accessToken: refreshResult.accessToken,
        }),
      );
    } catch {
      throw new UnauthorizedException();
    }
  }
}
