// apps/language/src/language.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { LanguageController } from './language.controller';
import { LanguageService } from './language.service';
import { CreateLanguageDto } from './dto/create-language.dto';
import { UpdateLanguageDto } from './dto/update-language.dto';

describe('LanguageController', () => {
  let controller: LanguageController;

  // Mock del LanguageService
  const mockLanguageService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LanguageController],
      providers: [
        {
          provide: LanguageService,
          useValue: mockLanguageService,
        },
      ],
    }).compile();

    controller = module.get<LanguageController>(LanguageController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should call languageService.create with the correct data', async () => {
      const createLanguageDto: CreateLanguageDto = { name: 'Peru', code: 'PE' };
      const expectedResult = { id: 3, ...createLanguageDto };

      mockLanguageService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createLanguageDto);

      // CORREGIDO
      expect(mockLanguageService.create).toHaveBeenCalledWith(createLanguageDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll()', () => {
    it('should call languageService.findAll', async () => {
      const expectedResult = [{ id: 1, name: 'Ecuador', code: 'EC' }];
      mockLanguageService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      // CORREGIDO
      expect(mockLanguageService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne()', () => {
    it('should call languageService.findOne with the correct id', async () => {
      const id = 1;
      const expectedResult = { id: 1, name: 'Ecuador', code: 'EC' };
      mockLanguageService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      // CORREGIDO
      expect(mockLanguageService.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update()', () => {
    it('should call languageService.update with the correct data', async () => {
      const id = 1;
      const updateLanguageDto: UpdateLanguageDto = {
        name: 'Republic of Ecuador',
      };
      const expectedResult = { id: 1, name: 'Republic of Ecuador', code: 'EC' };
      mockLanguageService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateLanguageDto);

      // CORREGIDO
      expect(mockLanguageService.update).toHaveBeenCalledWith(
        id,
        updateLanguageDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    it('should call languageService.remove with the correct id', async () => {
      const id = 1;
      mockLanguageService.remove.mockResolvedValue(undefined);

      await controller.remove(id);

      // CORREGIDO
      expect(mockLanguageService.remove).toHaveBeenCalledWith(id);
    });
  });
});
