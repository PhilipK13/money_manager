import { APIGatewayProxyEvent, Callback, Context, PostConfirmationTriggerEvent } from "aws-lambda";
import Client from "pg";

/**
 * @method POST
 * @description Add default group to user
 */
export const handler = async (
  event: APIGatewayProxyEvent,
): Promise<void> => {

  try {
    
  } catch (error) {
    console.error(error);
    throw error;
  }
};
