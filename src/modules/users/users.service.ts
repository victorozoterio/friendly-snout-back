import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async create(dto: CreateUserDto) {
    const userAlreadyExists = await this.repository.findOneBy({ email: dto.email });
    if (userAlreadyExists) throw new ConflictException('User already exists');

    const createdUser = this.repository.create(dto);
    return this.repository.save(createdUser);
  }

  async findAll() {
    return this.repository.find();
  }

  async findOne(uuid: string) {
    const userExists = await this.repository.findOneBy({ uuid });
    if (!userExists) throw new NotFoundException('User does not exist');

    return userExists;
  }

  async update(uuid: string, dto: UpdateUserDto) {
    const userExists = await this.repository.findOneBy({ uuid });
    if (!userExists) throw new NotFoundException('User does not exist');

    this.repository.merge(userExists, dto);
    return this.repository.save(userExists);
  }

  async remove(uuid: string) {
    const userExists = await this.repository.findOneBy({ uuid });
    if (!userExists) throw new NotFoundException('User does not exist');

    return this.repository.remove(userExists);
  }
}
