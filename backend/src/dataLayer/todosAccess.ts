import * as AWS  from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import  { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate'
import { createLogger } from '../utils/logger'

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('todos-data-layer');

export class TodoAccess {
  constructor(
    private readonly docClient: DocumentClient = new XAWS.DynamoDB.DocumentClient(),
    private readonly todosTable = process.env.TODOS_TABLE,
    private readonly userIdIndex = process.env.USER_ID_INDEX
  ) {}

  async getAllTodos(userId: string): Promise<TodoItem[]> {
    logger.info(`Getting user todos, User : ${userId}`)

    const result = await this.docClient.query({
        TableName: this.todosTable,
        IndexName: this.userIdIndex,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        }
      }).promise()
    
    const items = result.Items;

    return items as TodoItem[];
  }

  async getTodo(todoId: string): Promise<TodoItem> {
    logger.info(`Getting Todo Item. Todo: ${todoId}`)

    const result = await this.docClient.get({
        TableName: this.todosTable,
        Key: {
          todoId
        }
      }).promise();
    
    const item = result.Item;

    return item as TodoItem;
  }

  async updateTodo(todoId: string, updatedTodo: TodoUpdate): Promise<TodoUpdate> {
    logger.info(`Updating Todo Item. Todo ${todoId}`)
    await this.docClient.update({
        TableName: this.todosTable,
        Key: {
          todoId
        },
        UpdateExpression: 'set #name = :name, dueDate = :dueDate, done = :done',
        ExpressionAttributeNames: {
          "#name": "name"
        },
        ExpressionAttributeValues: {
          ":name": updatedTodo.name,
          ":dueDate": updatedTodo.dueDate,
          ":done": updatedTodo.done
        }
      }).promise();
    return updatedTodo as TodoUpdate;
  }

  async createTodo(todoItem: TodoItem): Promise<TodoItem> {
    logger.info(`Creating Todo Item`)
    await this.docClient.put({
        TableName: this.todosTable,
        Item: todoItem
      }).promise();   

    return todoItem;
  }

  async deleteTodo(todoId: string): Promise<void> {
    logger.info(`Deleting Todo Item, Todo: ${todoId}`)
    await this.docClient.delete({
        TableName: this.todosTable,
        Key: {
            todoId
        }
      }).promise();
  }

}
