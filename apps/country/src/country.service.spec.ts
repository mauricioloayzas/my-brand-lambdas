// apps/country/src/country.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { CountryService } from './country.service';
import { DatabaseService } from '@app/database';
import { NotFoundException } from '@nestjs/common';
import { mockClient } from 'aws-sdk-client-mock';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';

// Mock del cliente de DynamoDB
const dbMock = mockClient(DynamoDBDocumentClient);

describe('CountryService', () => {
  let service: CountryService;
  let databaseService: DatabaseService;

  // Mock de DatabaseService
  const mockDatabaseService = {
    // Mockeamos el método getNextId
    getNextId: jest.fn(),
    // Mockeamos la propiedad client, que es lo que usa nuestro servicio
    client: dbMock,
  };

  beforeEach(async () => {
    // Reseteamos los mocks antes de cada prueba
    dbMock.reset();
    mockDatabaseService.getNextId.mockClear();

    // Establecemos la variable de entorno necesaria para el constructor
    process.env.COUNTRIES_TABLE_NAME = 'test-countries-table';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryService,
        {
          // Reemplazamos el DatabaseService real por nuestro mock
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<CountryService>(CountryService);
    databaseService = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of countries', async () => {
      const mockCountries = [{ id: 1, name: 'Ecuador', code: 'EC' }];
      // Simulamos la respuesta del comando Scan
      dbMock.on(ScanCommand).resolves({ Items: mockCountries });

      const result = await service.findAll();

      expect(result).toEqual(mockCountries);
      expect(dbMock.commandCalls(ScanCommand).length).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a country if found', async () => {
      const mockCountry = { id: 1, name: 'Ecuador', code: 'EC' };
      // Simulamos la respuesta del comando Get
      dbMock.on(GetCommand).resolves({ Item: mockCountry });

      const result = await service.findOne(1);

      expect(result).toEqual(mockCountry);
    });

    it('should throw NotFoundException if country is not found', async () => {
      // Simulamos que no se encuentra ningún item
      dbMock.on(GetCommand).resolves({ Item: undefined });

      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new country', async () => {
      const newCountryData = { name: 'Colombia', code: 'CO' };
      const expectedId = 100;
      // Simulamos la respuesta de getNextId
      mockDatabaseService.getNextId.mockResolvedValue(expectedId);

      // Simulamos que PutCommand funciona sin errores
      dbMock.on(PutCommand).resolves({});

      const result = await service.create(newCountryData);

      expect(result.id).toBe(expectedId);
      expect(result.name).toBe(newCountryData.name);
      // Verificamos que se llamó a getNextId con el nombre de la tabla correcto
      expect(databaseService.getNextId).toHaveBeenCalledWith(
        'test-countries-table',
      );
    });
  });

  describe('update', () => {
    it('should update and return the updated country', async () => {
      const updatedData = { name: 'Republic of Ecuador' };
      const updatedCountry = { id: 1, name: 'Republic of Ecuador', code: 'EC' };
      // findOne es llamado dentro de update, así que debemos mockearlo
      dbMock
        .on(GetCommand)
        .resolves({ Item: { id: 1, name: 'Ecuador', code: 'EC' } });
      // Simulamos la respuesta del comando Update
      dbMock.on(UpdateCommand).resolves({ Attributes: updatedCountry });

      const result = await service.update(1, updatedData);

      expect(result).toEqual(updatedCountry);
    });
  });

  describe('remove', () => {
    it('should call DeleteCommand and not throw an error', async () => {
      // findOne es llamado dentro de remove
      dbMock
        .on(GetCommand)
        .resolves({ Item: { id: 1, name: 'Ecuador', code: 'EC' } });
      // Simulamos que DeleteCommand funciona sin errores
      dbMock.on(DeleteCommand).resolves({});

      await expect(service.remove(1)).resolves.not.toThrow();
      expect(dbMock.commandCalls(DeleteCommand).length).toBe(1);
    });
  });
});
