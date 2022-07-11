import { Callback, Context, PostConfirmationTriggerEvent } from "aws-lambda";
import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";
import { SecretsManagerClient, CancelRotateSecretCommand } from "@aws-sdk/client-secrets-manager";
import Client from "pg";

/**
 * @method POST
 * @description Add default group to user
 */
export const handler = async (
  event: PostConfirmationTriggerEvent,
  _context: Context,
  callback: Callback
): Promise<void> => {
  const { userPoolId, userName } = event;
  
  console.log(`User ${userName} confirmed`);
  console.log(event.request.userAttributes);

  try {
    const params = {
      GroupName: "user",
      UserPoolId: userPoolId,
      Username: userName,
    };

    return callback(null, event);
  } catch (error) {
    console.error(error);
    return callback(error as Error, event);
  }
};
