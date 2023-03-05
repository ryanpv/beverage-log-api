import cors from 'cors';
import 'dotenv/config.js'
import express from 'express';

const app = express();
app.use(cors());
app.use(express.json());

app.set('view engine', 'ejs'); // syntax that allows us to use view engine

app.get('/', (req, res) => {
  console.log('Here');
  res.render('index', { text: 'World' }) // by default all views live in 'views' folder. this will render the file with the name that === first argument passed. (using 'ejs' view engine in this project)
});

import bobaRouter from './routes/boba.js'
app.use('/boba', bobaRouter)

import coffeeRouter from './routes/coffee.js'
app.use('/coffee', coffeeRouter)












app.listen(3000, () => {
  console.log('server connected to port');
});