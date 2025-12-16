import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { verify } from 'argon2';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async signIn(dto: CreateAuthDto) {
    const user = await this.userRepository.findOneBy({ email: dto.email });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const doesPasswordMatch = await verify(user.password, dto.password);
    if (!doesPasswordMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { email: user.email, sub: user.uuid };
    const accessToken = this.jwtService.sign({ ...payload, type: 'access' }, { expiresIn: '30m' });
    const refreshToken = this.jwtService.sign({ ...payload, type: 'refresh' }, { expiresIn: '12h' });

    return { accessToken, refreshToken };
  }

  async refreshToken(dto: RefreshTokenDto) {
    const payload = this.jwtService.decode(dto.refreshToken);
    if (payload.type !== 'refresh') throw new UnauthorizedException('Invalid token type');

    const user = await this.userRepository.findOneBy({ uuid: payload.sub });
    if (!user) throw new UnauthorizedException('Invalid refresh token');

    const newPayload = { email: user.email, sub: user.uuid };
    const newAccessToken = this.jwtService.sign({ ...newPayload, type: 'access' }, { expiresIn: '30m' });
    const newRefreshToken = this.jwtService.sign({ ...newPayload, type: 'refresh' }, { expiresIn: '12h' });

    return { accessToken: newAccessToken, refreshToken: newRefreshToken };
  }
}
