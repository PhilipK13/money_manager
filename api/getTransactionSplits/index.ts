import { SecretsManager } from "@aws-sdk/client-secrets-manager";
import { APIGatewayProxyEvent } from "aws-lambda";
import { Client } from "pg";
import jwt, { JwtPayload } from "jsonwebtoken";

/**
 * @method POST
 * @description Returns a list transaction splits that are associated with a group
 */
export const handler = async (event: APIGatewayProxyEvent): Promise<any[]> => {
  const secrets = new SecretsManager({});

  const transactions: number[] = JSON.parse(event.body ?? "{}")
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

    // Query the transaction_splits table for all transaction splits that have a matching id for any of the numbers in the transactions array

    const { rows: transactions_splits } = await client.query(
      `
      SELECT *
        FROM transaction_splits
        WHERE transaction_id IN (${transactions.join(',')});
      `);
    

    console.log("Normal" + transactions_splits);
    console.log("STRINGIFY" + JSON.stringify(transactions_splits));

    return transactions_splits;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await client.end();
  }
};
