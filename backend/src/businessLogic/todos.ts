import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic
const todosAccess = new TodosAccess()

export async function getTodosForUser(userId:String):Promise<TodoItem[]>{
    return todosAccess.getTodosForUser(userId)
}

export async function createTodo(createTodoRequest:CreateTodoRequest, username: String): Promise<TodoItem[]>{
    const todoId = uuid.v4()

    var newTodo : TodoItem = {
        dueDate: createTodoRequest.dueDate,
        name: createTodoRequest.name,
        createdAt: new Date().toISOString(),
        done: false,
        userId: username,
        todoId: todoId
    } as TodoItem

    var createdTodo = await todosAccess.createTodo(newTodo)
    return createdTodo
}
export async function deleteTodo( todoId: string, userId: String): Promise<Boolean> {
    await todosAccess.deleteTodo(todoId, userId)
    return true
}

export async function getAllTodoItems(userId: String): Promise<TodoItem[]> {
    const allTodos = await todosAccess.getAllTodos(userId)
    return allTodos
}

export async function updateTodoItem(todoId: String, userId: String, todoUpdateRequest: UpdateTodoRequest): Promise<Boolean> {
    const updatedTodo = await todosAccess.updateTodo(
        todoId, 
        todoUpdateRequest.name,
        todoUpdateRequest.done, 
        todoUpdateRequest.dueDate,
        userId)
    return updatedTodo
}