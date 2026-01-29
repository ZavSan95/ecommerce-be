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
import type { StringValue } from 'ms';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { RefreshResponse } from './interfaces/refresh-response.interface';
import { LogoutDto } from './dto/logout.dto';
import { PaginationDto } from './dto/pagination.dto';

@Injectable()
export class AuthService {
    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
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

    private async buildAuthResponse(user: UserDocument): Promise<AuthResponse> {
    const userId = user._id.toString();

    const payload: JwtPayload = {
        sub: userId,
        email: user.email,
        roles: user.roles,
        permissions: user.permissions,
    };

    const accessToken = this.jwtService.sign(payload);
    const refreshToken = await this.generateRefreshToken(userId);

    await this.storeRefreshToken(user, refreshToken);

    return {
        user: {
        id: userId,
        email: user.email,
        name: user.name,
        roles: user.roles,
        },
        accessToken,
        refreshToken,
    };
    }


    private async generateRefreshToken(userId: string): Promise<string> {
        return this.jwtService.signAsync(
            { sub: userId },
            {
            secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
            expiresIn: this.config.get<StringValue>('JWT_REFRESH_EXPIRES_IN') ?? '7d',
            },
        );
    }

    private async storeRefreshToken(user: UserDocument, refreshToken: string) {
        const hash = await bcrypt.hash(refreshToken, 10);

        user.refreshTokens.push({
            tokenHash: hash,
            createdAt: new Date(),
        });

        await user.save();
    }

    async refresh(dto: RefreshTokenDto): Promise<RefreshResponse> {
        const { refreshToken } = dto;

        const payload = this.jwtService.verify<{ sub: string }>(
            refreshToken,
            {
            secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
            },
        );

        const user = await this.userModel.findById(payload.sub);
        if (!user) {
            throw new UnauthorizedException();
        }

        const tokenIndex = await Promise.any(
            user.refreshTokens.map(async (t, i) =>
            (await bcrypt.compare(refreshToken, t.tokenHash)) ? i : Promise.reject(),
            ),
        ).catch(() => -1);

        if (tokenIndex === -1) {
            throw new UnauthorizedException();
        }

        // 🔁 rotación
        user.refreshTokens.splice(tokenIndex, 1);

        const newAccessToken = this.jwtService.sign({
            sub: user._id.toString(),
            email: user.email,
            roles: user.roles,
            permissions: user.permissions,
        });

        const newRefreshToken = await this.generateRefreshToken(user._id.toString());
        await this.storeRefreshToken(user, newRefreshToken);

        return {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        };
    }

    async logout(dto: LogoutDto): Promise<{ success: true }> {
    const { refreshToken } = dto;

    // Buscamos un usuario que tenga tokens (optimización simple)
    const users = await this.userModel.find({
        'refreshTokens.tokenHash': { $exists: true },
    });

    let revoked = false;

    for (const user of users) {
        const before = user.refreshTokens.length;

        user.refreshTokens = user.refreshTokens.filter(
        t => !bcrypt.compareSync(refreshToken, t.tokenHash),
        );

        if (user.refreshTokens.length !== before) {
        revoked = true;
        await user.save();
        break;
        }
    }

    if (!revoked) {
        // No revelamos si el token existía o no
        throw new UnauthorizedException();
    }

    return { success: true };
    }

    async me(accessToken: string) {
        try {
            const payload = this.jwtService.verify(accessToken);

            const user = await this.userModel.findById(payload.sub).select(
            'email name roles',
            );

            if (!user) {
            throw new UnauthorizedException();
            }

            return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            roles: user.roles,
            };

        } catch {
            throw new UnauthorizedException();
        }
    }

    async getAll({ page = 1, limit = 20, sort, search }: PaginationDto){

        const query: any = { isActive: true };

        if(search){
            query.$or = [
                { name: new RegExp(search, 'i') },
                { email: new RegExp(search, 'i') },
            ];
        }

        const sortOptions = {};
        if (sort) {
        const [field, order] = sort.split(':');
        sortOptions[field] = order === 'desc' ? -1 : 1;
        }

        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.userModel
                .find(query)
                .select('_id email name roles permissions isActive createdAt updatedAt')
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean(),
            this.userModel.countDocuments(query),
        ]);

        return {
            data,
            meta: {
                totalItems: total,
                itemsPerPage: limit,
                currentPage: page,
                totalPages: Math.ceil(total / limit),
            },
        };
    }





}
