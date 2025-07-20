import { PickType } from '@nestjs/swagger';
import { LanguageEntity } from '@app/entites/language.entity';

export class CreateLanguageDto extends PickType(LanguageEntity, [
  'name',
  'code',
]) {}