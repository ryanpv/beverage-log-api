import { ddbDocClient } from '../ddb_actions/ddbDocClient.js';
import { PutCommand } from '@aws-sdk/lib-dynamodb';

export const postItem = async (params) => {
  try {
    const data = await ddbDocClient.send(new PutCommand(params));
    console.log('added item:', data);
  } catch (err) {
    console.log(err);
  };
};