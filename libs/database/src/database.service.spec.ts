import { Test, TestingModule } from '@nestjs/testing';
import { DatabaseService } from './database.service';
import { ConfigService } from '@nestjs/config'; // <-- Importa ConfigService

describe('DatabaseService', () => {
  let service: DatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DatabaseService,
        // Añade un mock de ConfigService para satisfacer la dependencia del constructor
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              // Devuelve valores de prueba si es necesario para el constructor
              if (key === 'AWS_REGION') {
                return 'us-east-1';
              }
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<DatabaseService>(DatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
