import { Injectable, NotFoundException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { InjectRepository } from '@nestjs/typeorm';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWT } from 'src/constants/auth.constants';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';

interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: JWT.SECRET_KEY,
    });
  }

  async validate(payload: JwtPayload): Promise<UserEntity> {
    const userExists = await this.userRepository.findOneBy({ uuid: payload.sub });
    if (!userExists) throw new NotFoundException('User does not exist');
    return userExists;
  }
}
