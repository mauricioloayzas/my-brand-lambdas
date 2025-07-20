import { PickType } from '@nestjs/swagger';
import { CountryEntity } from '@app/entites/country.entity';

export class CreateCountryDto extends PickType(CountryEntity, [
  'name',
  'code',
]) {}
