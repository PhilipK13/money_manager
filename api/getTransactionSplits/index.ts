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
    // Query the transaction_splits table for all transaction splits that have a matching id for any of the numbers in the JSON transactions array object
  
    const { rows } = await client.query(`
    select transactions.id, transaction_splits.share, transaction_splits.user_id from transactions 
    right join "transaction_splits" 
      on transaction_splits.transaction_id = transactions.id
        where transactions.group_id = $1;
    `, [group_id]);

    console.log("Normal" + rows);
    console.log("STRINGIFY" + JSON.stringify(rows));

    return rows;
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    await client.end();
  }
};
