import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res, UnauthorizedException } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from './decorators/public.decorator';
import { Request, Response } from 'express'; 
import { PaginationDto } from '../common/dto/pagination.dto';
import { AdminRegisterDto } from './dto/admin-register.dto';
import { UpdateAdminUserDto } from './dto/admin-update.dto';

@Controller('auth')
@Public()
export class AuthController {
  constructor(
    @Inject('NATS_CLIENT')
    private readonly natsClient: ClientProxy,
  ) {}

  @Get('me')
  async me(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {

    const accessToken = req.cookies?.access_token;
    const refreshToken = req.cookies?.refresh_token;

    // ❌ No hay ningún token
    if (!accessToken && !refreshToken) {
      throw new UnauthorizedException();
    }

    try {
      // 🟢 Intentamos validar access token
      const user = await firstValueFrom(
        this.natsClient.send('auth.me', { accessToken }),
      );

      return { user };

    } catch (error) {

      // 🔁 Access token inválido → intentamos refresh
      if (!refreshToken) {
        throw new UnauthorizedException();
      }

      try {
        const refreshResult = await firstValueFrom(
          this.natsClient.send('auth.refresh', { refreshToken }),
        );

        // 🔐 Seteamos nuevos tokens
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

        // 🔄 Volvemos a pedir el user con el nuevo access token
        const user = await firstValueFrom(
          this.natsClient.send('auth.me', {
            accessToken: refreshResult.accessToken,
          }),
        );

        return { user };

      } catch {
        // ❌ Refresh también falló → logout lógico
        throw new UnauthorizedException();
      }
    }
  }

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

  @Get('users')
  async getAll(@Query() pagination: PaginationDto){
    return firstValueFrom(
      this.natsClient.send('auth.users', pagination),
    );
  }

  @Post('admin-register')
  async adminRegister(@Body() dto: AdminRegisterDto){
    return firstValueFrom(
      this.natsClient.send('auth.register.admin', dto)
    );
  }

  @Patch('user/:id')
  async updateAdminUser(
    @Param('id') id: string,
    @Body() dto: UpdateAdminUserDto
  ){
    return firstValueFrom(
      this.natsClient.send('auth.update.admin', {
        id,
        data: dto,
      }),
    );
  }

  @Get('user/:id')
  async getUser(@Param('id') id: string){
    return firstValueFrom(
      this.natsClient.send('auth.user.get', id),
    );
  }

  @Patch('user/status/:id')
  toggleStatus(
    @Param('id') id: string
  ){
    return this.natsClient.send('auth.user.status', id);
  }
}
