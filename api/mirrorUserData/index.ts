import { Callback, Context, PostConfirmationTriggerEvent } from "aws-lambda";
import { CognitoIdentityProvider } from "@aws-sdk/client-cognito-identity-provider";
import { SecretsManager } from "@aws-sdk/client-secrets-manager";
import {Client} from "pg";

/**
 * @method POST
 * @description Add default group to user
 */
export const handler = async (
  event: PostConfirmationTriggerEvent,
  _context: Context,
  callback: Callback
): Promise<PostConfirmationTriggerEvent> => {

  const secrets = new SecretsManager({});

  const { SecretString: pgCredentials } = await secrets.getSecretValue({
    SecretId: "MoneyManager/Postgres",
  });
  const { host, password, port, username, dbInstanceIdentifier } = JSON.parse(
    pgCredentials ?? "{}"
  );

  const client = new Client({
    host,
    password,
    port,
    user: username,
    database: dbInstanceIdentifier,
  });

  
  const { email, picture, name, sub } = event.request.userAttributes;

  try {
    await client.connect();

    // Add user to group
    await client.query(
      `
      INSERT INTO users (id, email, name, picture) VALUES ($1, $2, $3, $4);
    `,
      [sub, email, name, picture]
    );

    return event
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await client.end();
  }
};
