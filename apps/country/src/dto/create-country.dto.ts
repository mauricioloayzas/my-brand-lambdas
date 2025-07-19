import { PickType } from '@nestjs/swagger';
import { CountryEntity } from '@app/entites';

export class CreateCountryDto extends PickType(CountryEntity, [
  'name',
  'code',
]) {}