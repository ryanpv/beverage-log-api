import { fromEnv } from "@aws-sdk/credential-providers"
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';

const ddbClient = new DynamoDBClient({ credentials: fromEnv(), region: 'us-east-1' });

// console.log('access key', process.env.AWS_ACCESS_KEY_ID);



export { ddbClient }