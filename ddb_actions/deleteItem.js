import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./ddbDocClient.js";

export const deleteItem = async (params) => {
  try {
    await ddbDocClient.send(new DeleteCommand(params));
    console.log('DELETE successful');
  } catch (err) {
    console.log('error', err);
  }
};