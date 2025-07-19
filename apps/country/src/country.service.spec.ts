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

const dbMock = mockClient(DynamoDBDocumentClient);

describe('CountryService', () => {
  let service: CountryService;

  const mockDatabaseService = {
    getNextId: jest.fn(),
    client: dbMock,
  };

  beforeEach(async () => {
    dbMock.reset();
    mockDatabaseService.getNextId.mockClear();
    process.env.COUNTRIES_TABLE_NAME = 'test-countries-table';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CountryService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<CountryService>(CountryService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of countries', async () => {
      const mockCountries = [{ id: 1, name: 'Ecuador', code: 'EC' }];
      dbMock.on(ScanCommand).resolves({ Items: mockCountries });
      const result = await service.findAll();
      expect(result).toEqual(mockCountries);
      expect(dbMock.commandCalls(ScanCommand).length).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a country if found', async () => {
      const mockCountry = { id: 1, name: 'Ecuador', code: 'EC' };
      dbMock.on(GetCommand).resolves({ Item: mockCountry });
      const result = await service.findOne(1);
      expect(result).toEqual(mockCountry);
    });

    it('should throw NotFoundException if country is not found', async () => {
      dbMock.on(GetCommand).resolves({ Item: undefined });
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new country', async () => {
      const newCountryData = { name: 'Colombia', code: 'CO' };
      const expectedId = 100;
      mockDatabaseService.getNextId.mockResolvedValue(expectedId);
      dbMock.on(PutCommand).resolves({});
      const result = await service.create(newCountryData);
      expect(result.id).toBe(expectedId);
      expect(result.name).toBe(newCountryData.name);
      expect(mockDatabaseService.getNextId).toHaveBeenCalledWith(
        'test-countries-table',
      );
    });
  });

  describe('update', () => {
    it('should update and return the updated country', async () => {
      const updatedData = { name: 'Republic of Ecuador' };
      const updatedCountry = { id: 1, name: 'Republic of Ecuador', code: 'EC' };
      dbMock
        .on(GetCommand)
        .resolves({ Item: { id: 1, name: 'Ecuador', code: 'EC' } });
      dbMock.on(UpdateCommand).resolves({ Attributes: updatedCountry });
      const result = await service.update(1, updatedData);
      expect(result).toEqual(updatedCountry);
    });
  });

  describe('remove', () => {
    it('should call DeleteCommand and not throw an error', async () => {
      dbMock
        .on(GetCommand)
        .resolves({ Item: { id: 1, name: 'Ecuador', code: 'EC' } });
      dbMock.on(DeleteCommand).resolves({});
      await expect(service.remove(1)).resolves.not.toThrow();
      expect(dbMock.commandCalls(DeleteCommand).length).toBe(1);
    });
  });
});
