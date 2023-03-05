import { UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./ddbDocClient.js";

export const updateItem = async (params) => {
  try {
    const data = await ddbDocClient.send(new UpdateCommand(params));
    console.log('Successfully updated item');
    return data;
  } catch (err) {
    console.log(err);
  }
}