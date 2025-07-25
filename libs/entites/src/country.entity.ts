import { IsInt, IsNotEmpty, IsString, MaxLength, isNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CountryEntity {
  @IsInt()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Unique identifier for the country',
    example: 1,
    type: Number,
  })
  id: number;

  @ApiProperty({
    description: 'Name of the country (max 20 characters)',
    example: 'Argentina',
    maxLength: 20,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(20)
  name: string;

  @ApiProperty({
    description: 'code of the country (max 3 characters)',
    example: 'Argentina',
    maxLength: 3,
    type: String,
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(3)
  code: string;
}
