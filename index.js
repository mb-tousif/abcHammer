const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const port = process.env.PORT || 4000;
const app = express();

// middleware

const corsConfig = {
  origin: true,
  Credential: true,
};
app.use(cors(corsConfig));
app.options("*", cors(corsConfig));
app.use(express.json());

function verifyJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).send({ message: "Unauthorized access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.SECRET_Token, function (err, decoded) {
    if (err) {
      return res.status(403).send({ message: "Forbidden access" });
    }
    req.decoded = decoded;
    next();
  });
}

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
    const ordersCollection = client.db("ABCHammer").collection("Orders");

    // Products API For Getting Data From Server!
    app.get("/products", async (req, res) => {
      const query = {};
      const cursor = productsCollection.find(query);
      const results = await cursor.toArray();
      // console.log(results);
      res.send(results);
    });

    // Make User Admin API
    // app.put("/user/admin/:email", async (req, res) => {
    //   const email = req.params.email;
    //     const filter = { email: email };
    //     const updateDoc = {
    //       $set: { role: "admin" },
    //     };
    //     const result = await usersCollection.updateOne(filter, updateDoc);
    //     res.send(result);
     
    // });
    app.put("/user/admin/:email", verifyJWT, async (req, res) => {
      const email = req.params.email;
      const requester = req.decoded.email;
      const requesterAccount = await usersCollection.findOne({
        email: requester,
      });
      if (requesterAccount.role === "admin") {
        const filter = { email: email };
        const updateDoc = {
          $set: { role: "admin" },
        };
        const result = await usersCollection.updateOne(filter, updateDoc);
        res.send(result);
      } else {
        res.status(403).send({ message: "forbidden" });
      }
    });

    // orders post API
    app.post("/orders", async (req, res) => {
      const newOrder = req.body;
      const query = { buyer: newOrder.email };
      const exists = await ordersCollection.findOne(query);
      if (exists) {
        return res.send({ success: false, newOrder: exists });
      }
      const results = await ordersCollection.insertOne(newOrder);
      res.send({ success: true, results });
    });

    // specific user order/my order API
    app.get("/orders", verifyJWT, async (req, res) => {
      const buyer = req.query.buyer;
      const decodedEmail = req.decoded.email;
      if (buyer === decodedEmail){
        const query = { buyer: buyer };
        const results = await ordersCollection.find(query).toArray();
        // console.log(results);
        res.send(results);
      }else{
        return res.status(403).send({ message: "Forbidden access" });
      }
    });

    // Admin API
    app.get("/admin/:email", async (req, res) => {
      const email = req.params.email;
      const user = await usersCollection.findOne({ email: email });
      const isAdmin = user.role === "admin";
      res.send({ admin: isAdmin });
    });

    // purchase API
    app.get("/products/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const results = await productsCollection.findOne(query);
      res.send(results);
    });

    // Reviews API For Getting Data From Server!
    app.get("/user",verifyJWT, async (req, res) => {
      const query = {};
      const cursor = usersCollection.find(query);
      const results = await cursor.toArray();
      // console.log(results);
      res.send(results);
    });

     app.put('/user/:email', async (req, res) => {
      const email = req.params.email;
      const user = req.body;
      const filter = { email: email };
      const options = { upsert: true };
      const updateDoc = {
        $set: user,
      };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      const token = jwt.sign({ email: email }, process.env.SECRET_Token, { expiresIn: '10d' })
      // console.log(token);
      res.send({ result, token });
      
    })


    // Reviews API For Getting Data From Server!
    app.get("/reviews", async (req, res) => {
      const query = {};
      const cursor = reviewsCollection.find(query);
      const results = await cursor.toArray();
      // console.log(results);
      res.send(results);
    });

    // addReview API
    app.post("/reviews", async (req, res) => {
      const newReview = req.body;
      const query = { name: newReview.name };
      const exists = await reviewsCollection.findOne(query);
      if (exists) {
        return res.send({ success: false, newReview: exists });
      }
      const results = await reviewsCollection.insertOne(newReview);
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