import 'dotenv/config';
import * as path from 'node:path';
import 'reflect-metadata';
import 'tsconfig-paths/register';

import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DataSource, DataSourceOptions } from 'typeorm';
import { DATABASE } from '../constants/database.constants';

export const buildOptions = (): DataSourceOptions => {
  const base: DataSourceOptions = {
    type: 'postgres',
    host: DATABASE.HOST,
    port: DATABASE.PORT,
    username: DATABASE.USERNAME,
    password: DATABASE.PASSWORD,
    database: DATABASE.NAME,
    entities: [path.join(__dirname, '/../modules/**/**/*.entity{.ts,.js}')],
    migrations: [path.join(__dirname, '/../migrations/*{.ts,.js}')],
    migrationsRun: true,
    synchronize: false,
    logging: false,
  };

  if (DATABASE.SCHEMA) {
    return { ...base, extra: { ...base.extra, options: `-c search_path=${DATABASE.SCHEMA},public` } };
  }

  return base;
};

export const AppDataSource = new DataSource(buildOptions());

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  useFactory: async (): Promise<TypeOrmModuleOptions> => buildOptions(),
};
