import { UserEntity } from 'src/modules/users/entities/user.entity';

export const mockUserEntity = (overrides?: Partial<UserEntity>): UserEntity => ({
  uuid: 'user-uuid-123',
  name: 'Test User',
  email: 'test@example.com',
  password: 'hashedPassword',
  resetCode: null,
  resetCodeExpiresAt: null,
  createdAt: new Date('2024-01-10'),
  updatedAt: new Date('2024-01-10'),
  ...overrides,
});
