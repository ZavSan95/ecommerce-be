import {
  Body,
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Query,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Request, Response } from 'express';

import { Public } from './decorators/public.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AdminRegisterDto } from './dto/admin-register.dto';
import { UpdateAdminUserDto } from './dto/admin-update.dto';
import { PaginationDto } from '../common/dto/pagination.dto';

import { getAuthenticatedUser } from './utils/get-authenticated-user';

@Controller('auth')
@Public()
export class AuthController {
  constructor(
    @Inject('NATS_CLIENT')
    private readonly natsClient: ClientProxy,
  ) {}

  // ==========================
  // ME (access + refresh)
  // ==========================
  @Get('me')
  async me(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await getAuthenticatedUser(
      req,
      res,
      this.natsClient,
    );

    return { user };
  }

  // ==========================
  // REGISTER
  // ==========================
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return firstValueFrom(
      this.natsClient.send('auth.register', dto),
    );
  }

  // ==========================
  // LOGIN
  // ==========================
  @Post('login')
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginDto,
  ) {
    try {
      const result = await firstValueFrom(
        this.natsClient.send('auth.login', dto),
      );

      res.cookie('access_token', result.accessToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 15 * 60 * 1000,
      });

      res.cookie('refresh_token', result.refreshToken, {
        httpOnly: true,
        secure: true,
        sameSite: 'none',
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return { user: result.user };
    } catch (err) {
      console.error('LOGIN ERROR FROM NATS:', err);
      throw err;
    }
  }

  // ==========================
  // REFRESH (manual)
  // ==========================
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
      secure: true,
      sameSite: 'none',
      maxAge: 15 * 60 * 1000,
    });

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    return { success: true };
  }

  // ==========================
  // LOGOUT
  // ==========================
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

    res.clearCookie('access_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });

    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      path: '/',
    });

    return { success: true };
  }

  // ==========================
  // USERS (admin)
  // ==========================
  @Get('users')
  async getAll(@Query() pagination: PaginationDto) {
    return firstValueFrom(
      this.natsClient.send('auth.users', pagination),
    );
  }

  // ==========================
  // ADMIN REGISTER
  // ==========================
  @Post('admin-register')
  async adminRegister(@Body() dto: AdminRegisterDto) {
    return firstValueFrom(
      this.natsClient.send('auth.register.admin', dto),
    );
  }

  // ==========================
  // UPDATE USER
  // ==========================
  @Patch('user/:id')
  async updateAdminUser(
    @Param('id') id: string,
    @Body() dto: UpdateAdminUserDto,
  ) {
    return firstValueFrom(
      this.natsClient.send('auth.update.admin', {
        id,
        data: dto,
      }),
    );
  }

  // ==========================
  // GET USER BY ID
  // ==========================
  @Get('user/:id')
  async getUser(@Param('id') id: string) {
    return firstValueFrom(
      this.natsClient.send('auth.user.get', id),
    );
  }

  // ==========================
  // TOGGLE STATUS
  // ==========================
  @Patch('user/status/:id')
  async toggleStatus(@Param('id') id: string) {
    return this.natsClient.send('auth.user.status', id);
  }
}
