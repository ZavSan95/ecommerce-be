import {
  IsEmail,
  IsEnum,
  IsString,
  MinLength,
} from 'class-validator';
import { UserRole } from '../enum/user-roles.enum';


export class UpdateAdminUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @IsEnum(UserRole, {
    message: 'El rol debe ser admin o customer',
  })
  role: UserRole;
}
