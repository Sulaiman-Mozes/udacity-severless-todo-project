import * as uuid from 'uuid'

import  { TodoItem } from '../models/TodoItem'
import { TodoAccess } from '../dataLayer/todosAccess'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { parseUserId } from '../auth/utils'
import { createLogger } from '../utils/logger'


const todosAccess = new TodoAccess();
const logger = createLogger('todos-business-logic');

export async function getAllTodos(jwtToken: string): Promise<TodoItem[]> {
  const userId = parseUserId(jwtToken)
  logger.info(`Initiated Request for getting all todos. User: ${userId}`)
  return await todosAccess.getAllTodos(userId);
}

export async function getTodo(todoId: string): Promise<TodoItem> {
    return await todosAccess.getTodo(todoId);
}

export async function updateTodo(todoId: string, jwtToken: string, updatedTodo: UpdateTodoRequest): Promise<TodoItem> {
    const userId = parseUserId(jwtToken);
    logger.info(`Initiated Request for updating todo. User: ${userId}, Todo: ${todoId}`)

    const item = await getTodo(todoId);

    if (!item || item.userId !== userId) {
        logger.error(`Item doesnot exist. User: ${userId}, Todo ${todoId}`)
        throw new Error('Item doesnot exist')
    }
    await todosAccess.updateTodo(todoId, updatedTodo);

    return {...item, ...updatedTodo}
}

export async function deleteTodos(todoId: string, jwtToken:string): Promise<void> {
    const userId = parseUserId(jwtToken);

    logger.info(`Initiated Request for deleting todo. User: ${userId}, Todo: ${todoId}`)

    const item = await getTodo(todoId);

    if (!item || item.userId !== userId) {
        logger.error(`Item doesnot exist. User: ${userId}, Todo ${todoId}`)
        throw new Error('Item doesnot exist')
    }

    return await todosAccess.deleteTodo(todoId);
}

export async function createTodo(
  createTodoRequest: CreateTodoRequest,
  jwtToken: string
): Promise<TodoItem> {

  const itemId = uuid.v4()
  const userId = parseUserId(jwtToken)

  logger.info(`Initiated Request for creating todo. User: ${userId}`)

  return await todosAccess.createTodo({
        todoId: itemId,
        userId: userId,
        createdAt: new Date().toISOString(),
        done: false,
        attachmentUrl: "",
        ...createTodoRequest
  })
}
