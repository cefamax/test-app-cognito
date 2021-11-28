import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import authconfig from './auth/auth.config';

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [authconfig]
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
