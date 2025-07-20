// apps/language/src/language.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { LanguageService } from './language.service';
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

describe('LanguageService', () => {
  let service: LanguageService;

  const mockDatabaseService = {
    getNextId: jest.fn(),
    client: dbMock,
  };

  beforeEach(async () => {
    dbMock.reset();
    mockDatabaseService.getNextId.mockClear();
    process.env.LANGUAGES_TABLE_NAME = 'test-languages-table';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LanguageService,
        {
          provide: DatabaseService,
          useValue: mockDatabaseService,
        },
      ],
    }).compile();

    service = module.get<LanguageService>(LanguageService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of languages', async () => {
      const mockCountries = [{ id: 1, name: 'Ecuador', code: 'EC' }];
      dbMock.on(ScanCommand).resolves({ Items: mockCountries });
      const result = await service.findAll();
      expect(result).toEqual(mockCountries);
      expect(dbMock.commandCalls(ScanCommand).length).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a language if found', async () => {
      const mockLanguage = { id: 1, name: 'Ecuador', code: 'EC' };
      dbMock.on(GetCommand).resolves({ Item: mockLanguage });
      const result = await service.findOne(1);
      expect(result).toEqual(mockLanguage);
    });

    it('should throw NotFoundException if language is not found', async () => {
      dbMock.on(GetCommand).resolves({ Item: undefined });
      await expect(service.findOne(999)).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create and return a new language', async () => {
      const newLanguageData = { name: 'Colombia', code: 'CO' };
      const expectedId = 100;
      mockDatabaseService.getNextId.mockResolvedValue(expectedId);
      dbMock.on(PutCommand).resolves({});
      const result = await service.create(newLanguageData);
      expect(result.id).toBe(expectedId);
      expect(result.name).toBe(newLanguageData.name);
      expect(mockDatabaseService.getNextId).toHaveBeenCalledWith(
        'test-languages-table',
      );
    });
  });

  describe('update', () => {
    it('should update and return the updated language', async () => {
      const updatedData = { name: 'Republic of Ecuador' };
      const updatedLanguage = { id: 1, name: 'Republic of Ecuador', code: 'EC' };
      dbMock
        .on(GetCommand)
        .resolves({ Item: { id: 1, name: 'Ecuador', code: 'EC' } });
      dbMock.on(UpdateCommand).resolves({ Attributes: updatedLanguage });
      const result = await service.update(1, updatedData);
      expect(result).toEqual(updatedLanguage);
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
