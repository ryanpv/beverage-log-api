import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { ddbClient } from "../libs/ddbClient.js";

export const queryTable = async (params) => {
  try {
    const data = await ddbClient.send(new QueryCommand(params));
    // data.Items.forEach(function (element) {
    //   console.log(element);
    // })
    console.log('QueryCommand called');
    return data;
  } catch (err) {
    console.log(err);
  }
}
