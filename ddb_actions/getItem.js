import { GetCommand } from "@aws-sdk/lib-dynamodb";
import { ddbDocClient } from "./ddbDocClient.js";

export const getItem = async (params) => {
  try {
    const data = await ddbDocClient.send(new GetCommand(params));
    console.log('successful GET:', data.Item);
    return data;
  } catch (err) {
    console.log('error', err);
  }
}