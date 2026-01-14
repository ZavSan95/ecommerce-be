import { Body, Controller, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { Request, Response } from 'express'; // 👈 ESTO ES CLAVE

@Controller('auth')
@Public()
export class AuthController {
  constructor(
    @Inject('NATS_CLIENT')
    private readonly natsClient: ClientProxy,
  ) {}

  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return firstValueFrom(
      this.natsClient.send('auth.register', dto),
    );
  }

  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginDto,
  ) {
    const result = await firstValueFrom(
      this.natsClient.send('auth.login', dto),
    );

    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { user: result.user };
  }

  @Post('refresh')
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;
    if (!refreshToken) {
      throw new UnauthorizedException();
    }

    const result = await firstValueFrom(
      this.natsClient.send('auth.refresh', { refreshToken }),
    );

    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { success: true };
  }

  @Post('logout')
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const refreshToken = req.cookies?.refresh_token;

    if (refreshToken) {
      await firstValueFrom(
        this.natsClient.send('auth.logout', { refreshToken }),
      );
    }

    res.clearCookie('access_token');
    res.clearCookie('refresh_token');

    return { success: true };
  }
}
