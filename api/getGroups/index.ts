import { SecretsManager } from "@aws-sdk/client-secrets-manager";
import { APIGatewayProxyEvent } from "aws-lambda";
import { Client } from "pg";
import jwt, { JwtPayload } from "jsonwebtoken";

/**
 * @method GET
 * @description Get the group id's that a user is a member of
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<any[]> => {
  const secrets = new SecretsManager({});

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

    // Query table for user's groups
    const { rows } = await client.query(
      `
      SELECT groups.id, groups.name, groups.description
      FROM groups
      JOIN user_groups ON groups.id = user_groups.group_id
      WHERE user_groups.user_id = $1;
    `,
      [userId]
    );

    const groups = rows

    return groups;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await client.end();
  }
};
