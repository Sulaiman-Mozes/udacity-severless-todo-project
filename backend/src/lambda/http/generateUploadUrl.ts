import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda';

import * as AWS from 'aws-sdk';
import * as AWSXRay from 'aws-xray-sdk';
import * as uuid from 'uuid'

import { parseUserId } from '../../auth/utils'


const XAWS = AWSXRay.captureAWS(AWS)

const docClient = new XAWS.DynamoDB.DocumentClient();

const todosTable = process.env.TODOS_TABLE;

const s3 = new XAWS.S3({ signatureVersion: 'v4' });
const bucketName = process.env.ATTACHMENTS_S3_BUCKET;
const urlExpiration = process.env.SIGNED_URL_EXPIRATION;


export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId;

  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];

  const userId = parseUserId(jwtToken);
  const attachmentId = uuid.v4();

  const result = await docClient.get({
    TableName: todosTable,
    Key: {
      todoId
    }
  }).promise()

  const item = result.Item

  if (!item || item.userId !== userId) {
    // logger.error(`User ${userId} does not have permission to update todo ${todoId}`)

    return{
      statusCode:404,
      headers:{
        'Access-Control-Allow-Origin': "*"
      },
      body: JSON.stringify({
        error: 'Item doesnot exist'
      })
    }
  }

  const uploadUrl = s3.getSignedUrl('putObject', {
    Bucket: bucketName,
    Key: attachmentId,
    Expires: urlExpiration
  });

  const attachmentUrl = `https://${bucketName}.s3.amazonaws.com/${attachmentId}`;


  await docClient.update({
    TableName: todosTable,
    Key: {
      todoId
    },
    UpdateExpression: 'set attachmentUrl = :attachmentUrl',
    ExpressionAttributeValues: {
      ':attachmentUrl': attachmentUrl
    }
  }).promise()


  // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
  return {
    statusCode:200,
    headers:{
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
        uploadUrl
    })
  }


}
