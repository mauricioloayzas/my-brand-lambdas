// apps/language/src/language.controller.ts
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
import { LanguageService } from './language.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { LanguageEntity } from '@app/entites/language.entity';

@ApiTags('languages') // Agrupa los endpoints en la UI de Swagger
@Controller('languages')
export class LanguageController {
  constructor(private readonly languageService: LanguageService) {
    console.log('LanguageService constructor called. ' + typeof languageService);
  }

  @Post()
  @ApiOperation({ summary: 'Crear un nuevo país' })
  @ApiResponse({
    status: 201,
    description: 'El país ha sido creado exitosamente.',
    type: LanguageEntity,
  })
  create(@Body() createLanguageDto: CreateLanguageDto) {
    return this.languageService.create(createLanguageDto);
  }

  @Get()
  @ApiOperation({ summary: 'Obtener todos los países' })
  @ApiResponse({
    status: 200,
    description: 'Lista de todos los países.',
    type: [LanguageEntity],
  })
  findAll() {
    return this.languageService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener un país por su ID' })
  @ApiResponse({
    status: 200,
    description: 'Detalles del país.',
    type: LanguageEntity,
  })
  @ApiResponse({ status: 404, description: 'País no encontrado.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.languageService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Actualizar un país existente' })
  @ApiResponse({
    status: 200,
    description: 'El país ha sido actualizado exitosamente.',
    type: LanguageEntity,
  })
  @ApiResponse({ status: 404, description: 'País no encontrado.' })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateLanguageDto: UpdateLanguageDto,
  ) {
    return this.languageService.update(id, updateLanguageDto);
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
    return this.languageService.remove(id);
  }
}
