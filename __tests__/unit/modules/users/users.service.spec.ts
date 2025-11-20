import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';

import { UsersService } from 'src/modules/users/users.service';
import { UserEntity } from 'src/modules/users/entities/user.entity';
import { CreateUserDto } from 'src/modules/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/modules/users/dto/update-user.dto';
import { hash } from 'argon2';

jest.mock('argon2', () => ({
  hash: jest.fn(),
}));

describe('UsersService', () => {
  let usersService: UsersService;
  let userRepository: Repository<UserEntity>;

  const mockUserRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    usersService = module.get<UsersService>(UsersService);
    userRepository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  });

  it('should be defined', () => {
    expect(usersService).toBeDefined();
    expect(userRepository).toBeDefined();
  });

  describe('create', () => {
    it('should throw ConflictException if user already exists', async () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'John Doe',
      };

      mockUserRepository.findOneBy.mockResolvedValueOnce({ email: dto.email });

      const createUserCall = usersService.create(dto);
      await expect(createUserCall).rejects.toThrow(ConflictException);
      await expect(createUserCall).rejects.toThrow('User already exists');
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ email: dto.email });
    });

    it('should create user with hashed password', async () => {
      const dto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password',
        name: 'John Doe',
      };

      mockUserRepository.findOneBy.mockResolvedValueOnce(null);
      (hash as jest.Mock).mockResolvedValueOnce('hashedPassword');

      const createdUser: Partial<UserEntity> = {
        uuid: '123',
        email: dto.email,
        password: 'hashedPassword',
        name: dto.name,
      };

      mockUserRepository.create.mockReturnValueOnce(createdUser);
      mockUserRepository.save.mockResolvedValueOnce(createdUser);

      const result = await usersService.create(dto);

      expect(hash).toHaveBeenCalledWith(dto.password);
      expect(mockUserRepository.create).toHaveBeenCalledWith({ ...dto, password: 'hashedPassword' });
      expect(mockUserRepository.save).toHaveBeenCalledWith(createdUser);
      expect(result).toBe(createdUser);
    });
  });

  describe('findAll', () => {
    it('should return all users', async () => {
      const users: Partial<UserEntity>[] = [
        { uuid: '1', email: 'a@test.com' },
        { uuid: '2', email: 'b@test.com' },
      ];

      mockUserRepository.find.mockResolvedValueOnce(users);

      const result = await usersService.findAll();

      expect(mockUserRepository.find).toHaveBeenCalled();
      expect(result).toBe(users);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOneBy.mockResolvedValueOnce(null);

      await expect(usersService.findOne('123')).rejects.toThrow(NotFoundException);
      await expect(usersService.findOne('123')).rejects.toThrow('User does not exist');
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
    });

    it('should return user if exists', async () => {
      const user = { uuid: '123', email: 'test@example.com' } as UserEntity;
      mockUserRepository.findOneBy.mockResolvedValueOnce(user);

      const result = await usersService.findOne('123');

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
      expect(result).toBe(user);
    });
  });

  describe('update', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOneBy.mockResolvedValueOnce(null);

      const dto: UpdateUserDto = { name: 'New Name' };

      await expect(usersService.update('123', dto)).rejects.toThrow(NotFoundException);
      await expect(usersService.update('123', dto)).rejects.toThrow('User does not exist');
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
    });

    it('should update and return user', async () => {
      const user: Partial<UserEntity> = { uuid: '123', email: 'test@example.com', name: 'Old Name' };
      const dto: UpdateUserDto = { name: 'New Name' };

      mockUserRepository.findOneBy.mockResolvedValueOnce(user);
      mockUserRepository.save.mockResolvedValueOnce({ ...user, ...dto });

      const result = await usersService.update('123', dto);

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
      expect(mockUserRepository.merge).toHaveBeenCalledWith(user, dto);
      expect(mockUserRepository.save).toHaveBeenCalledWith(user);
      expect(result).toEqual({ ...user, ...dto });
    });
  });

  describe('remove', () => {
    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOneBy.mockResolvedValueOnce(null);

      await expect(usersService.remove('123')).rejects.toThrow(NotFoundException);
      await expect(usersService.remove('123')).rejects.toThrow('User does not exist');
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
    });

    it('should remove user', async () => {
      const user: Partial<UserEntity> = { uuid: '123', email: 'test@example.com' };

      mockUserRepository.findOneBy.mockResolvedValueOnce(user);
      mockUserRepository.remove.mockResolvedValueOnce(user);

      await usersService.remove('123');

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ uuid: '123' });
      expect(mockUserRepository.remove).toHaveBeenCalledWith(user);
    });
  });
});
