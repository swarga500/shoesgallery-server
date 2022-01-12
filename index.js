const express = require('express')
const app = express()
const cors = require('cors')
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;
const { json } = require('express');
require('dotenv').config()
app.use(cors())
const port = process.env.PORT || 5000
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.get('/', (req, res) => {
  res.send('shoes gallery server running...')
})

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.xfro9.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
  try {
    await client.connect()
    const database = client.db('shoes-gallery')
    const productCollection = database.collection('products')
    const reviewCollection = database.collection('reviews')
    const orderCollection = database.collection('orders')
    const usersCollection = database.collection('users')

    //get products api
    app.get('/products', async (req, res) => {
      const cursor = productCollection.find({})
      const result = await cursor.toArray()
      res.json(result)
    })

    //add product api
    app.post('/products', async (req, res) => {
      const data = req.body;
      const result = await productCollection.insertOne(data)
      res.json(result)
    })
    //deltete product api
    app.delete('/products/:id', async (req, res) => {
      const id = req.params.id
      const query = { '_id': ObjectId(id) }
      const result = await productCollection.deleteOne(query)
      res.json(result)
    })

    //review api
    app.get('/reviews', async (req, res) => {
      const cursor = reviewCollection.find({})
      const result = await cursor.toArray()
      res.json(result)
    })

    //add review api
    app.post('/reviews', async (req, res) => {
      const data = req.body;
      const result = await reviewCollection.insertOne(data)
      res.json(result)
    })

    //getting apecific product
    app.get('/products/:id', async (req, res) => {
      const id = req.params.id
      const query = { '_id': ObjectId(id) }
      const result = await productCollection.findOne(query)
      res.json(result)
    })

    //order post api
    app.post('/orders', async (req, res) => {
      const data = req.body
      const result = await orderCollection.insertOne(data)
      res.json(result)
    })
    app.get('/orders', async (req, res) => {
      const email = req.query.email
      const query = { email: email }
      let cursor;
      if (email) {
        cursor = orderCollection.find(query)
      }
      else {
        cursor = orderCollection.find({})
      }
      const result = await cursor.toArray()
      res.json(result)
    })

    //order delete api
    app.delete('/orders/:id', async (req, res) => {
      const id = req.params.id
      const query = { '_id': ObjectId(id) }
      const result = await orderCollection.deleteOne(query)
      res.json(result)
    })
    //status update api
    app.put('/orders/:id', async (req, res) => {
      const id = req.params.id
      const status = req.body.status
      const filter = { '_id': ObjectId(id) }
      const options = { upsert: true };
      const updateDoc = {
        $set: {
          status: status
        }
      }
      const result = await orderCollection.updateOne(filter, updateDoc, options)
      res.json(result)
    })

    //add user api
    app.post('/users', async (req, res) => {
      const data = req.body
      const result = await usersCollection.insertOne(data)
      res.json(result)
    })
    //make amdin api
    app.put('/users/admin', async (req, res) => {
      const email = req.body.email
      const filter = { email: email }
      const updateDoc = {
        $set: {
          role: "admin"
        }
      }
      const result = await usersCollection.updateOne(filter, updateDoc)
      res.json(result)
    })

    //get admin api
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email
      const query = { email: email }
      const user = await usersCollection.findOne(query)
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true
      }
      res.json({ admin: isAdmin })
    })
  }
  finally {
    // await client.close()
  }
}

run().catch(console.dir)

app.listen(port, () => {
  console.log('I am listening port no: ', port)
})