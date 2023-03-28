import express from 'express';
import { ddbClient } from '../libs/ddbClient.js';
import { ListTablesCommand } from '@aws-sdk/client-dynamodb';
import { queryTable } from '../ddb_actions/queryTable.js';
import { postItem } from '../ddb_actions/putItem.js'
import { getItem } from '../ddb_actions/getItem.js';
import { deleteItem } from '../ddb_actions/deleteItem.js';
import { updateItem } from '../ddb_actions/updateItem.js';

const router = express.Router();

router.route('/')
  .get((req, res) => {
    res.send('boba home route')
  })
  .delete((req, res) => {
    res.send('DELETE boba route')
  });

//////////////////// RETRIEVE LIST OF TABLES //////////////////
router.route('/boba-table/:tableName')
  .get(async (req, res) => {
    try {
      const data = await ddbClient.send(new ListTablesCommand({}))
      console.log('retrieved tables:', data.TableNames);
      res.send(data)
    } catch (err) {
      console.log(err);
    }
  })

////////////////// POST BEVERAGE ITEM ////////////////////
router.route('/post-boba')
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
      console.log('added item successfully');
      res.send(data)
    } catch (err) {
      console.log(err);
    }
  });

///////////// UPDATE BEVERAGE PRICE //////////////////////
router.route('/update-item/:drinkName')
  .post(async (req, res) => {
    const params = {
      TableName: 'beverage-table',
      Key: {
        userId: 'testUser1',
        drinkName: `${ req.params.drinkName }`,
      },
      // ProjectionExpression: "#r",
      ExpressionAttributeNames: 
        !req.body.priceInputName ? { "#d": "description" }
        : !req.body.descriptionInputName ? { "#b": "basePrice" }
        : { "#b": "basePrice", "#d": "description" },
      // ExpressionAttributeNames: { "#b": "basePrice", "#d": "description" },
      ExpressionAttributeValues: 
        !req.body.priceInputName ? { ":d": req.body.descriptionInputName }
        : !req.body.descriptionInputName ? { ":b": parseFloat(req.body.priceInputName) }
        : {
            ":b": parseFloat(req.body.priceInputName),
            ":d": req.body.descriptionInputName
          },
      // ExpressionAttributeValues: {
      //   ":b": 5.99,
      //   ":d": undefined
      // }
      UpdateExpression: 
        !req.body.priceInputName ? "set #d = :d"
        : !req.body.descriptionInputName ? "set #b = :b"
        : "set #b = :b, #d = :d",
      // UpdateExpression: "set #b = :b, #d = :d",
    };
    try {
      const data = await updateItem(params);
      if (data.$metadata.httpStatusCode === 200) {
        console.log('update success', data)
        res.redirect('/')
      }
      // res.send(data)
    } catch (err) {
      console.log('err', err);
    }
  });

///////////// GET/DELETE SINGLE ITEM //////////////////////
router.route('/item/:storeBrand/:drinkName')
  .get(async (req, res) => {
    const params = {
      TableName: 'beverage-table',
      Key: {
        userId: 'testUser1',
        drinkName: `${ req.params.drinkName } - ${ req.params.storeBrand }`,
        // storeBrand: req.params.storeBrand
      }
    };

    try {
      const data = await getItem(params);
      res.send(data)
    } catch (err) {
      console.log(err);
    }
  })
  .delete(async (req, res) => {
    const params = {
      TableName: 'beverage-table',
      Key: {
        userId: 'testUser1',
        drinkName: `${ req.params.drinkName }`
      }
    };

    try {
      const data = await deleteItem(params);
      console.log('delete complete');

      res.redirect(303, '/boba');
    } catch (err) {
      console.log(err);
    }
  });

router.route('/delete-item/:drinkName')
  .get(async (req, res) => {
    const params = {
      TableName: 'beverage-table',
      Key: {
        userId: 'testUser1',
        drinkName: `${ req.params.drinkName }`
      }
    };
    try { 
      const data = await deleteItem(params);
      console.log('deleted with GET route');
      res.redirect('/boba/get-user-coffeelist');
    } catch (err) {
      console.log(err);
    };
  });

///////////// QUERY TABLE FOR SPECIFIC USER ITEMS /////////////// 
router.route('/user-posts')
  .get(async (req, res) => {
    const params = {
      TableName: "beverage-table",
      KeyConditionExpression: 'userId = :userId', 
      // KeyConditionExpression: 'userId = :userId and drinkName = :drinkName', // value is a string that specifies the key and a key value placeholder (colon required like dynamic params)
      ExpressionAttributeValues: {
        ":userId": { S: 'testUser1' },
        ":drinkType": { S: 'Boba' },
        // ":drinkName": { S: 'Taro Milk Tea - Sun Tea' } // this expression takes the key value placeholder and specifies the key and it's value type. "S" for string, "N" for number
      },
      ExpressionAttributeNames: {
        "#drinkType": "drinkType",
      },
      FilterExpression: "contains (#drinkType, :drinkType)",
      // ProjectionExpression: "additionalComments" // projection specifies what fields we want to return 
    }
    
    const data = await queryTable(params);
    // console.log(data);
    // res.send(data)
    res.render('pages/boba.ejs', {
      tableData: data.Items
    })
  });

/////////// QUERY TABLE FOR SPECIFIC BRAND /////////////////
router.route('/user-posts/:storeBrand')
  .get(async (req, res) => {
    const params = {
      TableName: "beverage-table",
      KeyConditionExpression: 'userId = :userId', 
      // KeyConditionExpression: 'userId = :userId and drinkName = :drinkName', // value is a string that specifies the key and a key value placeholder (colon required like dynamic params)
      ExpressionAttributeValues: {
        ":userId": { S: 'testUser1' },
        ":drinkType": { S: 'Boba' },
        ":storeBrand": { S: req.params.storeBrand }
        // ":drinkName": { S: 'Taro Milk Tea - Sun Tea' } // this expression takes the key value placeholder and specifies the key and it's value type. "S" for string, "N" for number
      },
      ExpressionAttributeNames: {
        "#drinkType": "drinkType",
        "#storeBrand": "storeBrand"
      },
      FilterExpression: "contains (#storeBrand, :storeBrand) and #drinkType = :drinkType",
      // ProjectionExpression: "additionalComments" // projection specifies what fields we want to return 
    }
    
    const data = await queryTable(params);
    console.log(data);
    res.send(data)
  });
  // .post(async (req, res) => {
  //   try {
  //     const data = await postItem()
  //     console.log('added item:', data);
  //     res.send(data)
  //   } catch (err) {
  //     console.log(err);
  //   }
  // });

 












// router.route('/:brand')
//   .get((req, res) => {
//     res.send(`currently looking at boba brand ${ req.params.brand }`)
//   })


// router.param('brand', (req, res, next, brand) => {
//   if (brand) {
//     console.log(brand, 'brand confirmed')
//   } else {
//     console.log(brand, 'not true');
//   }
//   return next();
// })


export default router