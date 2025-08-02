import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './auth/user.entity';
import { Payment } from './payments/payment.entity';
import dotenv from 'dotenv';
import { PaymentsModule } from './payments/payments.module';

dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URI,
      ssl: {
        rejectUnauthorized: false,
      },
      entities: [User, Payment],
      synchronize: true,
    }),
    AuthModule,
    PaymentsModule,
  ],
})
export class AppModule {}
