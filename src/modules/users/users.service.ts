import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  private database: UserEntity[] = [];

  async create(dto: CreateUserDto) {
    const userAlreadyExists = await this.database.find((user) => user.email === dto.email);
    if (userAlreadyExists) throw new ConflictException('User already exists');

    this.database.push({
      uuid: crypto.randomUUID(),
      ...dto,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as UserEntity);

    return this.database[this.database.length - 1];
  }

  async findAll() {
    return this.database;
  }

  async findOne(uuid: string) {
    const userExists = this.database.find((user) => user.uuid === uuid);
    if (!userExists) throw new NotFoundException('User does not exist');

    return userExists;
  }

  async update(uuid: string, dto: UpdateUserDto) {
    const userExists = this.database.find((user) => user.uuid === uuid);
    if (!userExists) throw new NotFoundException('User does not exist');

    const updatedUser = this.database.map((user) => {
      if (user.uuid === uuid) return { ...user, ...dto, updatedAt: new Date() };
      return user;
    });

    this.database = updatedUser;
    return updatedUser;
  }

  async remove(uuid: string) {
    const userExists = this.database.find((user) => user.uuid === uuid);
    if (!userExists) throw new NotFoundException('User does not exist');

    this.database = this.database.filter((user) => user.uuid !== uuid);
  }
}
