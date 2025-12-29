import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { verify } from 'argon2';
import { AuthService } from 'src/modules/auth/auth.service';
import { CreateAuthDto } from 'src/modules/auth/dto/create-auth.dto';
import { RefreshTokenDto } from 'src/modules/auth/dto/refresh-token.dto';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';

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
    decode: jest.fn(),
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

      await expect(authService.signIn(dto)).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });

    it('should throw UnauthorizedException if password is incorrect', async () => {
      const dto: CreateAuthDto = { email: 'test@example.com', password: 'password' };
      const mockUser: Partial<UserEntity> = { uuid: '1234', email: 'test@example.com', password: 'hashedPassword' };

      mockUserRepository.findOneBy.mockResolvedValueOnce(mockUser);
      (verify as jest.Mock).mockResolvedValueOnce(false);

      await expect(authService.signIn(dto)).rejects.toThrow(new UnauthorizedException('Invalid credentials'));
    });

    it('should return accessToken and refreshToken if credentials are valid', async () => {
      const dto: CreateAuthDto = { email: 'test@example.com', password: 'password' };
      const mockUser: Partial<UserEntity> = { uuid: '1234', email: 'test@example.com', password: 'hashedPassword' };

      mockUserRepository.findOneBy.mockResolvedValueOnce(mockUser);
      (verify as jest.Mock).mockResolvedValueOnce(true);
      mockJwtService.sign.mockReturnValueOnce('access_token').mockReturnValueOnce('refresh_token');

      const result = await authService.signIn(dto);
      expect(result).toEqual({ accessToken: 'access_token', refreshToken: 'refresh_token' });
      expect(mockJwtService.sign).toHaveBeenNthCalledWith(
        1,
        { email: dto.email, sub: mockUser.uuid, type: 'access' },
        { expiresIn: '30m' },
      );

      expect(mockJwtService.sign).toHaveBeenNthCalledWith(
        2,
        { email: dto.email, sub: mockUser.uuid, type: 'refresh' },
        { expiresIn: '12h' },
      );
    });
  });

  describe('refreshToken', () => {
    it('throws UnauthorizedException when token type is not refresh', async () => {
      const dto: RefreshTokenDto = { refreshToken: 'token' };

      (mockJwtService.decode as jest.Mock).mockReturnValueOnce({
        type: 'access', // invalid
        sub: '1234',
        email: 'test@example.com',
      });

      await expect(authService.refreshToken(dto)).rejects.toThrow(new UnauthorizedException('Invalid token type'));
    });

    it('throws UnauthorizedException when user is not found', async () => {
      const dto: RefreshTokenDto = { refreshToken: 'token' };

      (mockJwtService.decode as jest.Mock).mockReturnValueOnce({
        type: 'refresh',
        sub: '1234',
        email: 'test@example.com',
      });

      mockUserRepository.findOneBy.mockResolvedValueOnce(null); // user not found

      await expect(authService.refreshToken(dto)).rejects.toThrow(new UnauthorizedException('Invalid refresh token'));

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ uuid: '1234' });
    });

    it('returns new accessToken and refreshToken when refresh token is valid', async () => {
      const dto: RefreshTokenDto = { refreshToken: 'token' };

      (mockJwtService.decode as jest.Mock).mockReturnValueOnce({
        type: 'refresh',
        sub: '1234',
        email: 'test@example.com',
      });

      const user: Pick<UserEntity, 'uuid' | 'email'> = {
        uuid: '1234',
        email: 'test@example.com',
      };
      mockUserRepository.findOneBy.mockResolvedValueOnce(user);

      (mockJwtService.sign as jest.Mock)
        .mockReturnValueOnce('new_access_token')
        .mockReturnValueOnce('new_refresh_token');

      const result = await authService.refreshToken(dto);

      expect(result).toEqual({
        accessToken: 'new_access_token',
        refreshToken: 'new_refresh_token',
      });

      expect(mockJwtService.sign).toHaveBeenNthCalledWith(
        1,
        { email: user.email, sub: user.uuid, type: 'access' },
        { expiresIn: '30m' },
      );

      expect(mockJwtService.sign).toHaveBeenNthCalledWith(
        2,
        { email: user.email, sub: user.uuid, type: 'refresh' },
        { expiresIn: '12h' },
      );
    });
  });
});
