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
): Promise<void> => {

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

  const { userName } = event;
  const { email, picture, name } = event.request.userAttributes;
  
  console.log(`User ${userName} confirmed\nEmail: ${email}\nName: ${name}\nPicture: ${picture}`);

  try {
    await client.connect();

    // Add user to group
    await client.query(
      `
      INSERT INTO users (id, email, name, picture) VALUES ($1, $2, $3, $4);
    `,
      [userName, email, name, picture]
    );

  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await client.end();
  }
};
