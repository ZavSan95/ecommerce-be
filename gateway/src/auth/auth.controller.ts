import { Body, Controller, Post } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
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
  async login(@Body() dto: LoginDto) {
    return firstValueFrom(
      this.natsClient.send('auth.login', dto),
    );
  }
}
