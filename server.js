const express = require("express");

const app = express();

app.use(express.json());
app.set("port", 3000);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
  );

  next();
});

const { MongoClient, ObjectId } = require("mongodb");

let db;

MongoClient.connect(
  "mongodb+srv://wathonnadisan_315:holymoly315@cluster0.ksvpu.mongodb.net/"
)
  .then((client) => {
    db = client.db("coursework");
    console.log("Connected to MongoDB successfully!");
    app.listen(app.get("port"), () => {
      console.log("⁠Express.js server running at localhost:3000");
    });
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB:", err);
    process.exit(1);
  });

  app.param("collectionName", (req, res, next, collectionName) => {
    req.collection = db.collection(collectionName);
    return next();
  });

app.get("/collection/:collectionName", async (req, res, next) => {
  try {
    const results = await req.collection.find({}).toArray();
    res.json(results);
  } catch (err) {
    next(err);
  }
});



app.get("/collection/:collectionName", async (req, res, next) => {
  try {
    const results = await req.collection.find({}).toArray();
    console.log("Get function is success");
    res.json(results);
  } catch (err) {
    console.log("Get function is error");
    next(err);
  }
});

const ObjectID = require("mongodb").ObjectID;
app.get("/collection/:collectionName/:id", (req, res, next) => {
  req.collection.findOne({ _id: new ObjectID(req.params.id) }, (e, result) => {
    if (e) return next(e);
    res.send(result);
  });
});

app.get("/search", async (req, res) => {
  const searchQuery = req.query.q;  
  // if (!searchQuery) {
  //   return res.status(400).send("Search query is required.");
  // }
  try {
    const results = await db.collection('courses').find({
        $or: [
            { subject: { $regex: searchQuery, $options: "i" } },  
            { location: { $regex: searchQuery, $options: "i" } }, 
            { price: { $regex: searchQuery, $options: "i" } }    
        ]
    }).toArray();
    res.json(results); 
} catch (err) {
      console.error("Error in searching courses:", err);
      res.status(500).send("Server error");
  }
});
app.post("/collection/:collectionName", async (req, res, next) => {
  try {
    const result = await req.collection.insertOne(req.body);
    res.json({ insertedId: result.insertedId });
    console.log("Post function is success");
  } catch (err) {
    console.log("Post function is error");
    next(err);
  }
});

app.put("/collection/:collectionName/:id", async (req, res, next) => {
  try {
    const result = await req.collection.updateOne(
      { _id: new ObjectId(req.params.id) },  
      { $set: req.body }
    );
    res.json(
      result.modifiedCount === 1 ? { msg: "success" } : { msg: "error" }
    );
  } catch (err) {
    console.log("Put Error:", err);
    next(err);
  }
});

app.delete("/collection/:collectionName/:id", async (req, res, next) => {
  try {
    const result = await req.collection.deleteOne({ _id: new ObjectId(req.params.id) });  
    res.json(result.deletedCount === 1 ? { msg: "success" } : { msg: "error" });
  } catch (e) {
    console.log("Delete Error:", e);
    next(e);
  }
});

app.listen(3000, () => {
  console.log("Express.js server running at localhost:3000");
});
