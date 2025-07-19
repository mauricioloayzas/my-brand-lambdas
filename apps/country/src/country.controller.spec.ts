// apps/country/src/country.controller.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CountryController } from './country.controller';
import { CountryService } from './country.service';
import { CreateCountryDto } from './dto/create-country.dto';
import { UpdateCountryDto } from './dto/update-country.dto';

describe('CountryController', () => {
  let controller: CountryController;

  // Mock del CountryService
  const mockCountryService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CountryController],
      providers: [
        {
          provide: CountryService,
          useValue: mockCountryService,
        },
      ],
    }).compile();

    controller = module.get<CountryController>(CountryController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create()', () => {
    it('should call countryService.create with the correct data', async () => {
      const createCountryDto: CreateCountryDto = { name: 'Peru', code: 'PE' };
      const expectedResult = { id: 3, ...createCountryDto };

      mockCountryService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createCountryDto);

      // CORREGIDO
      expect(mockCountryService.create).toHaveBeenCalledWith(createCountryDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findAll()', () => {
    it('should call countryService.findAll', async () => {
      const expectedResult = [{ id: 1, name: 'Ecuador', code: 'EC' }];
      mockCountryService.findAll.mockResolvedValue(expectedResult);

      const result = await controller.findAll();

      // CORREGIDO
      expect(mockCountryService.findAll).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findOne()', () => {
    it('should call countryService.findOne with the correct id', async () => {
      const id = 1;
      const expectedResult = { id: 1, name: 'Ecuador', code: 'EC' };
      mockCountryService.findOne.mockResolvedValue(expectedResult);

      const result = await controller.findOne(id);

      // CORREGIDO
      expect(mockCountryService.findOne).toHaveBeenCalledWith(id);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('update()', () => {
    it('should call countryService.update with the correct data', async () => {
      const id = 1;
      const updateCountryDto: UpdateCountryDto = {
        name: 'Republic of Ecuador',
      };
      const expectedResult = { id: 1, name: 'Republic of Ecuador', code: 'EC' };
      mockCountryService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(id, updateCountryDto);

      // CORREGIDO
      expect(mockCountryService.update).toHaveBeenCalledWith(
        id,
        updateCountryDto,
      );
      expect(result).toEqual(expectedResult);
    });
  });

  describe('remove()', () => {
    it('should call countryService.remove with the correct id', async () => {
      const id = 1;
      mockCountryService.remove.mockResolvedValue(undefined);

      await controller.remove(id);

      // CORREGIDO
      expect(mockCountryService.remove).toHaveBeenCalledWith(id);
    });
  });
});
