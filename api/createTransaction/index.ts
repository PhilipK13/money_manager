import { SecretsManager } from "@aws-sdk/client-secrets-manager";
import { APIGatewayProxyEvent, APIGatewayProxyResultV2 } from "aws-lambda";
import { Client } from "pg";
import jwt, { JwtPayload } from "jsonwebtoken";

interface Transaction {
  group_id: number;
  cost: number;
  description: string;
  splits: TransactionSplit[];
}

interface TransactionSplit {
  user_id: string;
  share: number;
}

/**
 * @method POST
 * @description Add a transaction to a given group
 */
export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResultV2> => {
  try {
    const secrets = new SecretsManager({});

    const { cost, description, group_id, splits } = JSON.parse(
      event.body ?? "{}"
    ) as Transaction;
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
    const { sub: user_id } = jwt.decode(
      authorization.replace("Bearer ", "")
    ) as JwtPayload;

    try {
      await client.connect();

      const {
        rows: [newTransaction],
      } = await client.query<Omit<Transaction, "splits"> & { id: number }>(
        `
          INSERT INTO transactions (user_id, group_id, cost, description) VALUES ($1, $2, $3, $4) RETURNING *;
        `,
        [user_id, group_id, cost, description]
      );

      const newSplits: (TransactionSplit & { id: number })[] = [];

      for (const s of splits) {
        // Push the transaction split to Postgres and add it to the newSplits array
        const {
          rows: [newSplit],
        } = await client.query<TransactionSplit & { id: number }>(
          `
            INSERT INTO transaction_splits (transaction_id, user_id, share) VALUES ($1, $2, $3) RETURNING *;
          `,
          [newTransaction.id, s.user_id, s.share]
        );

        newSplits.push(newSplit);
      }

      return {
        statusCode: 201,
        body: JSON.stringify({ ...newTransaction, splits: newSplits }),
      };
    } catch (error) {
      console.error(error);

      return {
        statusCode: 400,
        body: JSON.stringify(error),
      };
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error(error);

    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Error connecting to databse." }),
    };
  }
};
