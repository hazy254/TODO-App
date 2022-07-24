import * as AWS from 'aws-sdk'
import * as AWSXRay from 'aws-xray-sdk'
import { DocumentClient } from 'aws-sdk/clients/dynamodb'
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

// const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess{
    constructor(
        private readonly docClient : DocumentClient = new XAWS.DynamoDB.DocumentClient(),
        private readonly todoTable = process.env.TODO_TABLE,
        private readonly indexName = process.env.SECONDARY_INDEX,
        private readonly LOGGER = createLogger("TODOITEM_ACCESS"),
        private readonly s3Bucket = process.env.ATTACHMENT_S3_BUCKET
        ) {}
    async getTodosForUser(userId:String) {
        this.LOGGER.info("Get all Todos made by a particular user")

        var result;
        try {
            result = await this.docClient.query({
                TableName: this.todoTable,
                IndexName: this.indexName,
                KeyConditionExpression: "userId = :userId",
                ExpressionAttributeValues: {":userId": userId}
            }).promise()
        } catch (error) {
            this.LOGGER.error("An error occured retrieving the TODOS").error(JSON.stringify(error))
        }
        this.LOGGER.info("Results obtained from query: " + JSON.stringify(result))
        const todos = result.Items
        return todos as TodoItem[]
    }
    async createTodo(todoItem: TodoItem): Promise<TodoItem> {
        this.LOGGER.info('Creation of a new TODO Item')
        try {await this.docClient.put({
            TableName: this.todoTable,
            Item: todoItem
        }).promise()}
        catch(error){
            this.LOGGER.error("Error creating TODO Item: ").error(JSON.stringify(error))
        }
        this.LOGGER.info('New TODO Created successfully')
        return todoItem
    }
    async deleteTodo(todoItemId: String, userId: String): Promise<Boolean> {
        this.LOGGER.info("Deleting TODO Item of ID: " + JSON.stringify(todoItemId))
        await this.docClient.delete(
            {
                TableName: this.todoTable,
                Key: {
                    "userId": userId,
                    "todoId": todoItemId
                }
            }
        ).promise()
        this.LOGGER.info("TODO Item successfully deleted. ID: " + JSON.stringify(todoItemId))
        return true
    }
    async updateTodo(todoUpdate:TodoUpdate, todoID: string, userID: string): Promise<TodoUpdate> {
        this.LOGGER.info("Updating ToDo")
        const args = {
            TableName: this.todoTable,
            Key: {
                "userId": userID,
                "todoId": todoID
            },
            UpdateExpression: "set #a = :a, #b = :b, #c = :c",
            ExpressionAttributeNames: {
                "#a": "name",
                "#b": "dueDate",
                "#c": "done"
            },
            ExpressionAttributeValues: {
                ":a": todoUpdate['name'],
                ":b": todoUpdate['dueDate'],
                ":c": todoUpdate['done']
            },
            ReturnValues: "ALL_NEW"
        };
        const result = await this.docClient.update(args).promise
        this.LOGGER.info("Update successful with res: " + JSON.stringify(result))
        return result.Attributes as TodoUpdate
    }
    async generateUploadUrl(todoId: string): Promise<string> {
        this.LOGGER.info("Generating S3 Signed URL");
        const s3Client = new XAWS.S3({
            signatureVersion: 'v4'
        })
        const url = s3Client.getSignedUrl('putObject', {
            Bucket: this.s3Bucket,
            Key: todoId,
            Expires: 3000,
        });
        this.LOGGER.info("Signed URL: " + JSON.stringify(url));

        return url as string
    }
    
}