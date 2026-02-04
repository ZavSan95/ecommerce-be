import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { RegisterDto } from './dto/register.dto';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { LogoutDto } from './dto/logout.dto';
import { PaginationDto } from './dto/pagination.dto';
import { AdminRegisterDto } from './dto/admin-register.dto';
import { UpdateAdminUserDto } from './dto/admin-update.dto';


@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService
  ){}

  @MessagePattern('auth.register')
  register(@Payload() dto: RegisterDto){
    return this.authService.register(dto);
  }

  @MessagePattern('auth.login')
  login(@Payload() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @MessagePattern('auth.refresh')
  refresh(@Payload() dto: RefreshTokenDto) {
    return this.authService.refresh(dto);
  }

  @MessagePattern('auth.logout')
  logout(@Payload() dto: LogoutDto) {
    return this.authService.logout(dto);
  }

  @MessagePattern('auth.me')
  me(@Payload() { accessToken }: { accessToken: string } ){
    return this.authService.me(accessToken);
  }

  @MessagePattern('auth.users')
  async getAll(pagination: PaginationDto){
    return this.authService.getAll(pagination);
  }

  @MessagePattern('user.verify')
  async verifyUser(@Payload() dto: string){
    return this.authService.verifyUser(dto);
  }

  @MessagePattern('auth.register.admin')
  async adminRegister(@Payload() dto: AdminRegisterDto){
    return this.authService.adminRegister(dto);
  }

  @MessagePattern('auth.user.get')
  async getUser(@Payload() id: string){
    return this.authService.getUser(id);
  }

  @MessagePattern('auth.update.admin')
  async updateAdminUser(
    @Payload()
    payload: {
      id: string;
      data: UpdateAdminUserDto;
    },
  ) {
    const { id, data } = payload;
    return this.authService.updateAdminUser(id, data);
  }

  @MessagePattern('auth.user.status')
  async toggleUserStatus(
    @Payload() id: string
  ){
    return this.authService.toggleUserStatus(id);
  }
  

}
