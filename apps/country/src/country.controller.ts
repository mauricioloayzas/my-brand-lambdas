// apps/country/src/country.controller.ts
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CountryEntity } from '@app/entites';

@ApiTags('countries') // Agrupa los endpoints en la UI de Swagger
@Controller('countries')
export class CountryController {
  constructor(private readonly countryService: CountryService) {
    console.log('CountryService constructor called. ' + typeof countryService); 
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo país' })
  @ApiResponse({
    status: 201,
    description: 'El país ha sido creado exitosamente.',
    type: CountryEntity,
  })
  create(@Body() createCountryDto: CreateCountryDto) {
    return this.countryService.create(createCountryDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los países' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los países.',
    type: [CountryEntity],
  })
  findAll() {
    return this.countryService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un país por su ID' })
  @ApiResponse({
    status: 200,
    description: 'Detalles del país.',
    type: CountryEntity,
  })
  @ApiResponse({ status: 404, description: 'País no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.countryService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un país existente' })
  @ApiResponse({
    status: 200,
    description: 'El país ha sido actualizado exitosamente.',
    type: CountryEntity,
  })
  @ApiResponse({ status: 404, description: 'País no encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCountryDto: UpdateCountryDto,
  ) {
    return this.countryService.update(id, updateCountryDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT) // Devuelve un código 204 en lugar de 200
  @ApiOperation({ summary: 'Eliminar un país' })
  @ApiResponse({
    status: 204,
    description: 'El país ha sido eliminado exitosamente.',
  })
  @ApiResponse({ status: 404, description: 'País no encontrado.' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.countryService.remove(id);
  }
}
