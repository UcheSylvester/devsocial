const express = require("express");
const mongoose = require("mongoose");

const keys = require("./config/keys");

const app = express();

// DB CONFIG
const db = keys.mongoURI;

// CONNECT TO MONGODB
mongoose
  .connect(db, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
    useFindAndModify: false,
    useCreateIndex: true,
  })
  .then((res) => console.log("DB connnected successfully!", res))
  .catch((err) => console.log("DB connection failed"));

app.get("/", (req, res) => res.send("HELLO!"));

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
