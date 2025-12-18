import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { hash } from 'argon2';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly repository: Repository<UserEntity>,
  ) {}

  async create(dto: CreateUserDto) {
    const userAlreadyExists = await this.repository.findOneBy({ email: dto.email });
    if (userAlreadyExists) throw new ConflictException('User already exists');

    const passwordHash = await hash(dto.password);
    const createdUser = this.repository.create({ ...dto, password: passwordHash });
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

    await this.repository.remove(userExists);
  }
}
