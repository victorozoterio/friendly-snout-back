import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { databaseConfig, envConfig } from './config';
import { BearerAuthGuard } from './guards';
import { AnimalsModule } from './modules/animals/animals.module';
import { AttachmentsModule } from './modules/attachments/attachments.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { MedicineApplicationsModule } from './modules/medicine-applications/medicine-applications.module';
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
    MedicineApplicationsModule,
    AttachmentsModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: BearerAuthGuard,
    },
  ],
})
export class AppModule {}
