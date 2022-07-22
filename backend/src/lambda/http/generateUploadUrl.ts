import 'source-map-support/register'
import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { createAttachmentPresignedUrl } from '../../businessLogic/todos'
import { getUserId } from '../utils'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const logger = createLogger('S3SignedURL')
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    logger.info("Before fetching a signed URL from S3")
    const s3 = new AWS.S3({
      signatureVersion: 'v4'
    })
    const preSignedURL = await s3.getSignedUrl('putObject', {
      Bucket: process.env.ATTACHMENTS_BUCKET_NAME,
      Key: todoId,
      Expires: '600'
    })
    
    logger.info("SignedURL function successfully called")
    
    const userId = getUserId(event) 
    const attachmentURL = `https://todo-att-bucket-${process.env.STAGE}.s3.${process.env.region}.amazonaws.com/${todoId}`
    await createAttachmentPresignedUrl(todoId, userId, attachmentURL)
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers" : "*",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "*"
    },
      body: `{ "uploadUrl": "${preSignedURL}" }`
    }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
