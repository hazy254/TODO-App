import 'source-map-support/register'
//import * as AWS from 'aws-sdk'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { createLogger } from '../../utils/logger'
import { generateUploadUrl } from '../../businessLogic/todos'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    const logger = createLogger('S3SignedURL')
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    logger.info("Generating signed URL from event")
    const preSignedURL = await generateUploadUrl(todoId)
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
