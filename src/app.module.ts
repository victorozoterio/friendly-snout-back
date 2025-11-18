import { Module } from '@nestjs/common';
import { HealthModule } from './modules/health/health.module';
import { UsersModule } from './modules/users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { databaseConfig, envConfig } from './config';

@Module({
  imports: [ConfigModule.forRoot(envConfig), TypeOrmModule.forRootAsync(databaseConfig), HealthModule, UsersModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
