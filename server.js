import cors from 'cors';
import 'dotenv/config.js'
import express from 'express';
import { postItem } from './ddb_actions/putItem.js'
import { getItem } from './ddb_actions/getItem.js'

const app = express();
app.use(cors({ origin: true }));
app.use(express.urlencoded({ extended: true }))
app.use(express.json());

app.set('view engine', 'ejs'); // syntax that allows us to use view engine

app.get('/', (req, res) => {
  console.log('At index page');
  res.render('pages/index.ejs', { text: 'World' }) // by default all views live in 'views' folder. this will render the file with the name that === first argument passed. (using 'ejs' view engine in this project)
});

app.get('/submit-new-drink', (req, res) => {
  res.render('pages/postForm.ejs')
});

app.get('/update-drink-form/:storeBrand/:drinkName', async (req, res) => {
  const params = {
    TableName: 'beverage-table',
    Key: {
      userId: 'testUser1',
      drinkName: `${ req.params.drinkName }`,
      // storeBrand: req.params.storeBrand
    }
  };
  const dataItem = await getItem(params);
  
  res.render('pages/updateForm.ejs', {
    itemData: dataItem.Item
  })
});

app.post('/post-beverage', async (req, res) => {
  const params = {
    TableName: 'beverage-table',
    Item: {
      userId: req.body.userId === undefined ? 'testUser1' : req.body.userId,
      storeBrand: req.body.brandInputName,
      drinkName: `${ req.body.drinkName } - ${ req.body.brandInputName }`, // for unique key in DDB - DB doesn't allow for duplicate keys      description: req.body.descriptionInputName,
      basePrice: parseFloat(req.body.priceInputName),
      drinkType: req.body.drinkTypeInputName,
      description: req.body.descriptionInputName
    }
  };
  // console.log(params);
  // console.log('req body', req.body);

  try {
    const data = await postItem(params)
    console.log('added item successfully');
    // res.send(data)
  } catch (err) {
    console.log(err);
  }

  res.redirect('/submit-new-drink')
});




import bobaRouter from './routes/boba.js'
app.use('/boba', bobaRouter)

import coffeeRouter from './routes/coffee.js'
app.use('/coffee', coffeeRouter)









app.listen(3000, () => {
  console.log('server connected to port');
});