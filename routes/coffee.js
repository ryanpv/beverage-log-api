import express from 'express';
import { queryTable } from '../ddb_actions/queryTable.js';
import { postItem } from '../ddb_actions/putItem.js'
import { getItem } from '../ddb_actions/getItem.js';
import { deleteItem } from '../ddb_actions/deleteItem.js';
import { updateItem } from '../ddb_actions/updateItem.js';

const router = express.Router();

//////////// POST COFFEE ITEM ///////////////
router.route('/post-coffee')
  .post(async (req, res) => {
    const params = {
      TableName: 'beverage-table',
      Item: {
        userId: req.body.userId,
        storeBrand: req.body.storeBrand,
        drinkName: `${ req.body.drinkName } - ${ req.body.storeBrand }`,
        description: req.body.description,
        basePrice: req.body.basePrice,
        drinkType: req.body.drinkType
      }
    };

    try {
      const data = await postItem(params)
      console.log('coffee item POSTed successfully');
      res.send(data)
    } catch (err) {
      console.log(err);
    }
  });


////////// GET USER LIST FOR COFFEE DRINKTYPE //////////////
router.route('/get-user-coffeeList')
  .get(async (req, res) => {
    const params = {
      TableName: 'beverage-table',
      KeyConditionExpression: 'userId = :userId', 
      ExpressionAttributeValues: {
        ":userId": { S: 'testUser1' },
        ':drinkType': { S: 'Coffee' }
      },
      ExpressionAttributeNames: {
        '#drinkType': 'drinkType',

      },
      FilterExpression: "contains (#drinkType, :drinkType)"
    };

    // try {
      const data = await queryTable(params);
      console.log('get coffeelist', data);
      res.send(data)
    // } catch (err) {
    //   console.log(err);
    // }
  });

//////////////// GET/DELETE SINGLE ITEM////////////////
router.route('/item/:storeBrand/:drinkName')
  .get(async (req, res) => {
    const params = {
      TableName: 'beverage-table',
      Key: {
        userId: 'testUser1',
        drinkName: `${ req.params.drinkName } - ${ req.params.storeBrand }`
      }
    };

    try {
      const data = await getItem(params);
      res.send(data);
    } catch (err) {
      console.log(err);
    };
  })
  .delete(async (req, res) => {
    const params = {
      TableName: 'beverage-table',
      Key: {
        userId: 'testUser1',
        drinkName: `${ req.params.drinkName } - ${ req.params.storeBrand }`
      }
    };

    try { 
      const data = await deleteItem(params);
      res.end();
    } catch (err) {
      console.log(err);
    }
  });

////////////// UPDATE PRICE/DESCRIPTION ////////////////
router.route('/update-item')
  .put(async (req, res) => {
    const params = {
      TableName: 'beverage-table',
      Key: {
        userId: req.body.userId,
        drinkName: `${ req.body.drinkName } - ${ req.body.storeBrand }`
      },
      ExpressionAttributeNames:
        !req.body.basePrice ? { "#d": "description" }
        : !req.body.description ? { "#b": "basePrice" }
        : {
          "#b": "basePrice",
          "#d": "description"
        },
      ExpressionAttributeValues:
        !req.body.basePrice ? { ":d": req.body.description }
        : !req.body.description ? { ":b": req.body.basePrice }
        : {
          ":b": req.body.basePrice,
          ":d": req.body.description
        },
        UpdateExpression:
        !req.body.basePrice ? "set #d = :d"
        : !req.body.description ? "set #b = :b"
        : "set #b = :b, #d = :d"
    };
    try {
      const data = await updateItem(params);
      console.log('coffee update successful');
      res.send(data)
    } catch (err) {
      console.log(err);
    }
  })



export default router