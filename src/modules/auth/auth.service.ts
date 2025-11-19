import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UserEntity } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { verify } from 'argon2';

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

    const payload = { email: dto.email, sub: user.uuid };
    const accessToken = this.jwtService.sign(payload);
    return { accessToken };
  }
}
