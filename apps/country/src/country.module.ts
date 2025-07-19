import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CountryController } from './country.controller';
import { CountryService } from './country.service';
import { DatabaseModule } from '@app/database';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
  ],
  controllers: [CountryController],
  providers: [CountryService],
})
export class CountryModule {}
