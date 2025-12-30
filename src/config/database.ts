import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';
import 'dotenv/config';
import * as path from 'node:path';
import 'reflect-metadata';
import 'tsconfig-paths/register';
import { DataSource, DataSourceOptions } from 'typeorm';

export const buildOptions = (): DataSourceOptions => {
  const base: DataSourceOptions = {
    type: 'postgres',
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: [path.join(__dirname, '/../modules/**/**/*.entity{.ts,.js}')],
    migrations: [path.join(__dirname, '/../migrations/*{.ts,.js}')],
    migrationsRun: false,
    synchronize: false,
    logging: false,
  };

  const schema = process.env.DB_SCHEMA;

  if (schema) {
    return { ...base, extra: { ...base.extra, options: `-c search_path=${schema},public` } };
  }

  return base;
};

export const AppDataSource = new DataSource(buildOptions());

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  useFactory: async (): Promise<TypeOrmModuleOptions> => buildOptions(),
};
