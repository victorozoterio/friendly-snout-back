import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig, envConfig } from './config';
import { AnimalsModule } from './modules/animals/animals.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { MedicineBrandsModule } from './modules/medicine-brands/medicine-brands.module';
import { MedicinesModule } from './modules/medicines/medicines.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot(envConfig),
    TypeOrmModule.forRootAsync(databaseConfig),
    HealthModule,
    UsersModule,
    AuthModule,
    AnimalsModule,
    MedicineBrandsModule,
    MedicinesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
