import { SecretsManager } from "@aws-sdk/client-secrets-manager";
import { APIGatewayProxyEvent } from "aws-lambda";
import { Client } from "pg";
import jwt, { JwtPayload } from "jsonwebtoken";

/**
 * @method POST
 * @description Add default group to user
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<void> => {
  const secrets = new SecretsManager({});

  const { name, description = "" } = JSON.parse(event.body ?? "{}");
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

    // Create group
    const { rows: groupCreateRows } = await client.query(
      `
      INSERT INTO groups (name, description) VALUES ($1,$2) RETURNING *;
    `,
      [name, description]
    );
    const group = groupCreateRows[0];

    // Add user to group
    await client.query(
      `
      INSERT INTO user_groups (user_id, group_id) VALUES ($1, $2);
    `,
      [userId, group.id]
    );

    return group;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await client.end();
  }
};
