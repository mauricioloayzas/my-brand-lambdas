// apps/country/src/country.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '@app/database';
import {
  DynamoDBDocumentClient,
  PutCommand,
  ScanCommand,
  GetCommand,
  DeleteCommand,
  UpdateCommand,
} from '@aws-sdk/lib-dynamodb';
import { CountryEntity } from '@app/entites';

@Injectable()
export class CountryService {
  private readonly tableName: string;
  private readonly dynamoDB: DynamoDBDocumentClient;

  constructor(private readonly databaseService: DatabaseService) {
    this.dynamoDB = this.databaseService.client; // Obtenemos el cliente
    console.log('CountryService constructor called.');

    const tableNameFromEnv = process.env.COUNTRIES_TABLE_NAME;

    if (!tableNameFromEnv) {
      throw new Error('COUNTRIES_TABLE_NAME environment variable is not set.');
    }

    this.tableName = tableNameFromEnv;
    console.log('table in se3rvice ' + this.tableName);
  }

  /**
   * Crea un nuevo país en la base de datos.
   */
  async create(countryData: Omit<CountryEntity, 'id'>): Promise<CountryEntity> {
    const newId = await this.databaseService.getNextId(this.tableName);

    const newCountry: CountryEntity = {
      id: newId,
      ...countryData,
    };

    const command = new PutCommand({
      TableName: this.tableName,
      Item: newCountry,
    });

    await this.dynamoDB.send(command);
    return newCountry;
  }

  /**
   * Devuelve todos los países de la base de datos.
   */
  async findAll(): Promise<CountryEntity[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
    });

    const result = await this.dynamoDB.send(command);
    return (result.Items as CountryEntity[]) || [];
  }

  /**
   * Busca y devuelve un país por su ID.
   */
  async findOne(id: number): Promise<CountryEntity> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { id },
    });

    const result = await this.dynamoDB.send(command);

    if (!result.Item) {
      throw new NotFoundException(`Country with ID "${id}" not found.`);
    }

    return result.Item as CountryEntity;
  }

  /**
   * Actualiza los datos de un país existente.
   */
  async update(
    id: number,
    updateData: Partial<Omit<CountryEntity, 'id'>>,
  ): Promise<CountryEntity> {
    // Asegura que el país exista antes de intentar actualizarlo
    await this.findOne(id);

    const updateExpression: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    for (const key in updateData) {
      if (Object.prototype.hasOwnProperty.call(updateData, key)) {
        const attrName = `#${key}`;
        const attrValue = `:${key}`;
        updateExpression.push(`${attrName} = ${attrValue}`);
        expressionAttributeNames[attrName] = key;
        expressionAttributeValues[attrValue] =
          updateData[key as keyof typeof updateData];
      }
    }

    if (updateExpression.length === 0) {
      return this.findOne(id);
    }

    const command = new UpdateCommand({
      TableName: this.tableName,
      Key: { id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await this.dynamoDB.send(command);
    return result.Attributes as CountryEntity;
  }

  /**
   * Elimina un país de la base de datos por su ID.
   */
  async remove(id: number): Promise<void> {
    // Asegura que el país exista antes de intentar borrarlo
    await this.findOne(id);

    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: { id },
    });

    await this.dynamoDB.send(command);
  }
}
