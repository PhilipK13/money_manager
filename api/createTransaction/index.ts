import { SecretsManager } from "@aws-sdk/client-secrets-manager";
import { APIGatewayProxyEvent } from "aws-lambda";
import { Client } from "pg";
import jwt, { JwtPayload } from "jsonwebtoken";

/**
 * @method POST
 * @description Add a transaction to a given group 
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<void> => {
  const secrets = new SecretsManager({});

  const { cost, description, groupId = "" } = JSON.parse(event.body ?? "{}");
  const { authorization } = event.headers;

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

  if (!authorization) throw new Error("Authorization header is missing");
  const { sub: userId } = jwt.decode(
    authorization.replace("Bearer ", "")
  ) as JwtPayload;

  try {
    await client.connect();

  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await client.end();
  }
};
