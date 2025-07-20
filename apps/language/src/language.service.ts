// apps/language/src/language.service.ts
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
import { LanguageEntity } from '@app/entites/language.entity';

@Injectable()
export class LanguageService {
  private readonly tableName: string;
  private readonly dynamoDB: DynamoDBDocumentClient;

  constructor(private readonly databaseService: DatabaseService) {
    this.dynamoDB = this.databaseService.client; // Obtenemos el cliente
    console.log('LanguageService constructor called.');

    const tableNameFromEnv = process.env.LANGUAGES_TABLE_NAME;

    if (!tableNameFromEnv) {
      throw new Error('LANGUAGES_TABLE_NAME environment variable is not set.');
    }

    this.tableName = tableNameFromEnv;
    console.log('table in se3rvice ' + this.tableName);
  }

  /**
   * Crea un nuevo language en la base de datos.
   */
  async create(languageData: Omit<LanguageEntity, 'id'>): Promise<LanguageEntity> {
    const newId = await this.databaseService.getNextId(this.tableName);

    const newLanguage: LanguageEntity = {
      id: newId,
      ...languageData,
    };

    const command = new PutCommand({
      TableName: this.tableName,
      Item: newLanguage,
    });

    await this.dynamoDB.send(command);
    return newLanguage;
  }

  /**
   * Devuelve todos los languages de la base de datos.
   */
  async findAll(): Promise<LanguageEntity[]> {
    const command = new ScanCommand({
      TableName: this.tableName,
    });

    const result = await this.dynamoDB.send(command);
    return (result.Items as LanguageEntity[]) || [];
  }

  /**
   * Busca y devuelve un language por su ID.
   */
  async findOne(id: number): Promise<LanguageEntity> {
    const command = new GetCommand({
      TableName: this.tableName,
      Key: { id },
    });

    const result = await this.dynamoDB.send(command);

    if (!result.Item) {
      throw new NotFoundException(`Language with ID "${id}" not found.`);
    }

    return result.Item as LanguageEntity;
  }

  /**
   * Actualiza los datos de un language existente.
   */
  async update(
    id: number,
    updateData: Partial<Omit<LanguageEntity, 'id'>>,
  ): Promise<LanguageEntity> {
    // Asegura que el language exista antes de intentar actualizarlo
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
    return result.Attributes as LanguageEntity;
  }

  /**
   * Elimina un language de la base de datos por su ID.
   */
  async remove(id: number): Promise<void> {
    // Asegura que el language exista antes de intentar borrarlo
    await this.findOne(id);

    const command = new DeleteCommand({
      TableName: this.tableName,
      Key: { id },
    });

    await this.dynamoDB.send(command);
  }
}
