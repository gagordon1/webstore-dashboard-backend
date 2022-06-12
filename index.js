const express = require('express');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json())
const port = process.env.PORT;

const { MongoClient } = require("mongodb");
// Connection URI
const uri = process.env.MONGODB_URI;
// Create a new MongoClient
const client = new MongoClient(uri);


// ROUTES
require('./orders')(app, client);
require('./printful')(app);
const printfulStoreData = require('./printfulStoreData');


app.get('/updateProducts', (req, res) => {
  printfulStoreData.updateProductData(res);
});

app.get('/updateRegions', (req, res) => {
  printfulStoreData.updateRegionData(res);
});

//PRODUCT INTERFACE
//{
  // thumbnail : String
  // name : String
  // retailPrice : String
  // availableSizes : [String]
  // id : Number
// }

//RETURNS [
//          PRODUCT
//        ]
app.get('/products', (req, res) =>{
  try{
    res.send(require("./products.json"));
  }
  catch(error){
    res.send(error);
  }

});


app.get('/product-details/:id', (req, res) => {
  try{
    let products = require("./products.json");
    res.send(products.find((obj) => {return obj.id == req.params.id}));
  }
  catch(error){
    res.send(error);
  }
});

app.get('/regions', (req, res) => {
  try{
    res.send(require("./regions.json"));
  }
  catch(error){
    res.send(error);
  }

});



app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
