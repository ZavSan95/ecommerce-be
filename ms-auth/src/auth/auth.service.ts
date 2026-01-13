import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse } from './interfaces/auth-response.interface';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginDto } from './dto/login.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly jwtService: JwtService
    ){}

    async register(dto: RegisterDto): Promise<AuthResponse> {

        const exists = await this.userModel.findOne({ email: dto.email });
        if (exists) {
            throw new ConflictException('Email already registered');
        }

        const hashedPassword = await bcrypt.hash(dto.password, 10);

        const user = await this.userModel.create({
            email: dto.email,
            password: hashedPassword,
            name: dto.name,
            roles: ['user'],
            permissions: [],
            isActive: true,
        });

        return this.buildAuthResponse(user);
    }


    async login(dto: LoginDto): Promise<AuthResponse> {

    const user = await this.userModel.findOne({ email: dto.email });
    if (!user || !user.password) {
        throw new UnauthorizedException('Invalid credentials');
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
        throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
        throw new UnauthorizedException('User inactive');
    }

    return this.buildAuthResponse(user);
    }

    private buildAuthResponse(user: UserDocument): AuthResponse {
    const userId = user._id.toString();

    const payload: JwtPayload = {
        sub: userId,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions,
    };

    return {
        user: {
        id: userId,
        email: user.email,
        name: user.name,
        roles: user.roles,
        },
        accessToken: this.jwtService.sign(payload),
        refreshToken: 'TODO_REFRESH_TOKEN',
    };
    }


}
