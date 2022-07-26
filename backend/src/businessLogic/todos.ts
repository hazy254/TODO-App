import { TodosAccess } from '../dataLayer/todosAcess'
//import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { TodoUpdate } from '../models/TodoUpdate';


// TODO: Implement businessLogic
const todosAccess = new TodosAccess()
const logger = createLogger("TODOS")

export async function getTodosForUser(userId:String):Promise<TodoItem[]>{
    logger.info("Getting todos for particular user of ID: " + JSON.stringify(userId))
    return todosAccess.getTodosForUser(userId)
}

export async function createTodo(createTodoRequest:CreateTodoRequest, userId: string): Promise<TodoItem>{
    logger.info("Creating new todo")
    const todoId = uuid.v4()
    const s3BucketName = process.env.ATTACHMENT_S3_BUCKET
    var newTodo : TodoItem = {
        dueDate: createTodoRequest.dueDate,
        name: createTodoRequest.name,
        createdAt: new Date().toISOString(),
        done: false,
        userId: userId,
        todoId: todoId,
        attachmentUrl:  `https://${s3BucketName}.s3.amazonaws.com/${todoId}`
    } as TodoItem 

    const createdTodo =  await todosAccess.createTodo(newTodo)
    return createdTodo
    
}
export async function deleteTodo( todoId: string, userId: String): Promise<string> {
    logger.info('Deleting todo of ID: ' + JSON.stringify(todoId))
    await todosAccess.deleteTodo(todoId, userId)
    const response = "Deleted Todo of ID: " + JSON.stringify(todoId)
    return response
}


export async function updateTodoItem(todoId: string, userId: string, todoUpdateRequest: UpdateTodoRequest): Promise<TodoUpdate> {
    logger.info("Updating todo of ID: " + JSON.stringify(todoId))
    const updatedTodo = await todosAccess.updateTodo(todoUpdateRequest, todoId, userId)
    return updatedTodo
}

export function generateUploadUrl(todoId: string): Promise<string> {
    return todosAccess.generateUploadUrl(todoId);
}