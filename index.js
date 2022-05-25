const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 4000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = `mongodb+srv://${process.env.MONGODB_USER_NAME}:${process.env.MONGODB_USER_PASSWORD}@abchammer.8trn1.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const productsCollection = client.db("ABCHammer").collection("Products");
    const reviewsCollection = client.db("ABCHammer").collection("Reviews");
    const usersCollection = client.db("ABCHammer").collection("Users");

    // Products API For Getting Data From Server!
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const results = await cursor.toArray();
      // console.log(results);
      res.send(results);
    });

    // purchase API
     app.get("/products/:id", async (req, res) => {
       const id = req.params.id;
       const query = { _id:ObjectId(id)};
       const results = await productsCollection.findOne(query);
       res.send(results);
     });

    // Reviews API For Getting Data From Server!
    app.get("/users", async (req, res) => {
      const query = {};
      const cursor = usersCollection.find(query);
      const results = await cursor.toArray();
      // console.log(results);
      res.send(results);
    });

    // POST user data when user sign up
    app.post("/users", async (req, res) => {
      const newUser = req.body;
      const query = { email: newUser.email, name: newUser.name };
      const exists = await usersCollection.findOne(query);
      if (exists) {
        return res.send({ success: false, newUser: exists });
      }
      const results = await usersCollection.insertOne(newUser);
      res.send(results);
    });

    // Get user data
    app.get("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const results = await usersCollection.findOne(query);
      res.send(results);
    });

    // Reviews API For Getting Data From Server!
    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviewsCollection.find(query);
      const results = await cursor.toArray();
      // console.log(results);
      res.send(results);
    });
  } finally {
    //  await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Happy Coding");
});

app.listen(port, () => {
  console.log("Hello Server!!");
});