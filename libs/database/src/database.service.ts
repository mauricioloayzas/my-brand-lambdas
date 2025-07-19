import { Injectable } from '@nestjs/common';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';

@Injectable()
export class DatabaseService {
  public readonly client: DynamoDBDocumentClient;
  private readonly countersTableName = 'Counters';

  constructor() {
    console.log('DatabaseService constructor called: creating DynamoDB client...');
    
    this.client = DynamoDBDocumentClient.from(new DynamoDBClient({}));
    console.log('DynamoDB client created successfully in DatabaseService.');
  }

  async getNextId(entityName: string): Promise<number> {
    const command = new UpdateCommand({
      TableName: this.countersTableName,
      Key: { counterName: entityName },
      UpdateExpression:
        'SET currentValue = if_not_exists(currentValue, :start) + :incr',
      ExpressionAttributeValues: {
        ':start': 0,
        ':incr': 1,
      },
      ReturnValues: 'UPDATED_NEW',
    });

    try {
      const result = await this.client.send(command);
      return result.Attributes?.currentValue as number;
    } catch (error) {
      console.error(`Error generating new ID for ${entityName}:`, error);
      throw new Error('Could not generate a new ID.');
    }
  }
}