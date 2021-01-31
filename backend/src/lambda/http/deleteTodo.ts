import 'source-map-support/register'

import { APIGatewayProxyEvent, APIGatewayProxyResult, APIGatewayProxyHandler } from 'aws-lambda'
import { deleteTodos } from '../../businessLogic/todos'



export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  const todoId = event.pathParameters.todoId

  const authorization = event.headers.Authorization;
  const split = authorization.split(' ');
  const jwtToken = split[1];

  try {

    await deleteTodos(todoId, jwtToken);

    return {
      statusCode:204,
      headers:{
        'Access-Control-Allow-Origin': '*'
      },
      body: ''
    }
  } catch (error) {
    return{
      statusCode:400,
      headers:{
        'Access-Control-Allow-Origin': "*"
      },
      body: JSON.stringify({
        error: 'An error occured when deleting, please try again'
      })
    }
  }
  
   

  // TODO: Remove a TODO item by id

}
