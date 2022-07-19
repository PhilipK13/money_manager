import { SecretsManager } from "@aws-sdk/client-secrets-manager";
import { APIGatewayProxyEvent } from "aws-lambda";
import { Client } from "pg";
import jwt, { JwtPayload } from "jsonwebtoken";

/**
 * @method GET
 * @description Returns a list of transactions that belong to a given group
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<any[]> => {
  const secrets = new SecretsManager({});

  const { group_id } = JSON.parse(event.body ?? "{}")
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

    // Query the transaction table for all transactions that belong to the group
    const { rows: transactions } = await client.query(
    `
      SELECT * FROM transactions WHERE group_id = $1;
    `,
      [group_id]
    );
    

    console.log("Normal" + transactions);
    console.log("STRINGIFY" + JSON.stringify(transactions));

    return transactions;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await client.end();
  }
};
