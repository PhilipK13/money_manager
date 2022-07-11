import { Callback, Context, PostConfirmationTriggerEvent } from "aws-lambda";
import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";

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

  try {
    const params = {
      GroupName: "user",
      UserPoolId: userPoolId,
      Username: userName,
    };

    const cognito = new CognitoIdentityProvider({ region: "us-east-1" });

    await cognito.adminAddUserToGroup(params);

    return callback(null, event);
  } catch (error) {
    console.error(error);
    return callback(error as Error, event);
  }
};
