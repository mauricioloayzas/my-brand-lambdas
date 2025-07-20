import { IsInt, IsString, MaxLength, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LanguageEntity {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Unique identifier for the language',
    example: 1,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the language (max 20 characters)',
    example: 'Argentina',
    maxLength: 20,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  name: string;

  @ApiProperty({
    description: 'code of the language (max 5 characters)',
    example: 'Argentina',
    maxLength: 3,
    type: String,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(3)
  code: string;
}
