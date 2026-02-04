import {
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../enum/user-roles.enum';


export class AdminRegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  name: string;

  @IsEnum(UserRole, {
    message: 'El rol debe ser admin o customer',
  })
  role: UserRole;
}
