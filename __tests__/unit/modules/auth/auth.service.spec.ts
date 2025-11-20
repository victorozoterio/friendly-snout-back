import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from 'src/modules/auth/auth.service';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException } from '@nestjs/common';
import { CreateAuthDto } from 'src/modules/auth/dto/create-auth.dto';
import { verify } from 'argon2';

jest.mock('argon2', () => ({
  verify: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let jwtService: JwtService;
  let userRepository: Repository<UserEntity>;

  const mockUserRepository = {
    findOneBy: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(authService).toBeDefined();
    expect(jwtService).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('signIn', () => {
    it('should throw UnauthorizedException if user not found', async () => {
      const dto: CreateAuthDto = { email: 'test@example.com', password: 'password' };

      mockUserRepository.findOneBy.mockResolvedValueOnce(null);

      await expect(authService.signIn(dto)).rejects.toThrow(UnauthorizedException);
      await expect(authService.signIn(dto)).rejects.toThrow('Invalid credentials');
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const dto: CreateAuthDto = { email: 'test@example.com', password: 'password' };
      const mockUser: Partial<UserEntity> = { uuid: '1234', email: 'test@example.com', password: 'hashedPassword' };

      mockUserRepository.findOneBy.mockResolvedValueOnce(mockUser);
      (verify as jest.Mock).mockResolvedValueOnce(false);

      await expect(authService.signIn(dto)).rejects.toThrow(UnauthorizedException);
      await expect(authService.signIn(dto)).rejects.toThrow('Invalid credentials');
    });

    it('should return an access token if credentials are valid', async () => {
      const dto: CreateAuthDto = { email: 'test@example.com', password: 'password' };
      const mockUser: Partial<UserEntity> = { uuid: '1234', email: 'test@example.com', password: 'hashedPassword' };

      mockUserRepository.findOneBy.mockResolvedValueOnce(mockUser);
      (verify as jest.Mock).mockResolvedValueOnce(true);
      mockJwtService.sign.mockReturnValue('access_token');

      const result = await authService.signIn(dto);
      expect(result).toEqual({ accessToken: 'access_token' });
      expect(mockJwtService.sign).toHaveBeenCalledWith({ email: dto.email, sub: mockUser.uuid });
    });
  });
});
