const express = require("express");
const cors = require("cors");
require("dotenv").config();
const port = process.env.PORT || 4000;
const app = express();

// middleware
app.use(cors());
app.use(express.json());

async function run() {
  try {



  } finally {

       await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Happy Coding");
});

app.listen(port, () => {
  console.log("Hello Server!!");
});