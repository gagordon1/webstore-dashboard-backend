const express = require('express');
const dotenv = require('dotenv');
const axios  = require('axios');

var cors = require('cors');

// use it before all route definitions


dotenv.config();

const app = express();
app.use(express.json())
app.use(cors({origin: 'http://localhost:4200'}));
const port = process.env.PORT;

const { MongoClient } = require("mongodb");
// Connection URI
const uri = process.env.MONGODB_URI;
// Create a new MongoClient
const client = new MongoClient(uri);

const options = {
  headers: {
    Authorization: 'Bearer ' + process.env.PRINTFUL_AUTH_KEY
  }
}



//gets order data from mongo (array of order documents from mongo)
app.get('/orders', async (req, res) => {
  console.log("hi")
  const orders = await client.db("WebstoreDB").collection("Orders").find().toArray()
  res.send(JSON.stringify(orders));
});

//Request {
//  orderId : Integer
//}
//
// Response:
// 200 : successfully cancelled the order on printful & update in mongo
// 400 : could not find the order
// 404 : error cancelling with printful
// 404 : error updating mongodb but cancelled on printful
//
app.post('/cancel-order', async (req, res) => {

  const url = process.env.PRINTFUL_ORDERS_ENDPOINT + String(req.body.orderId)

  try{
    const rawResponse = await axios.delete(
        url,
        options
      )
    console.log(`Successfully cancelled printful order ${req.body.orderId}`)

  }catch(error){
    console.log(error)
    res.status(400).send(error.message)
  }

  try{
    const database = client.db("WebstoreDB")
    const orders = database.collection("Orders");
    const filter = { id : req.body.orderId };
    // create a document that sets the plot of the movie
    const updateDoc = {
      $set: {
        cancelled : true
      }
    };
    const result = await orders.updateOne(filter, updateDoc);
    if (result.modifiedCount === 1){
      res.send(result)
    }
    else{
      res.status(400).send(`Mongo updated ${result.modifiedCount} documents instead of 1.`)
    }

  }catch(error){
    console.log(error)
    res.status(400).send(error.message)
  }
});

//Request {
//  orderId : Integer
//}
//
// Response:
// 200 : successfully confirmed the order for shipping & update in mongo
// 400 : could not find the order
// 404 : error confirming
// 404 : error updating mongodb but cancelled on printful
app.post('/confirm-order', async (req, res) => {

  const url = process.env.PRINTFUL_ORDERS_ENDPOINT + String(req.body.orderId) + "/confirm"

  try{
    const rawResponse = await axios.post(
        url,
        {},
        options
      )
  }catch(error){
    console.log(error)
    res.status(400).send(error.message)
  }


  try{
    const database = client.db("WebstoreDB")
    const orders = database.collection("Orders");
    const filter = { id : req.body.orderId };
    // create a document that sets the plot of the movie
    const updateDoc = {
      $set: {
        shipped : true
      }
    };
    const result = await orders.updateOne(filter, updateDoc);
    res.send(result);
  }catch(error){
    console.log(error);
    res.status(400).send(error.message);
  }

});






app.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
