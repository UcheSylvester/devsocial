const express = require("express");
const mongoose = require("mongoose");

const users = require("./routes/api/users");
const posts = require("./routes/api/posts");
const profile = require("./routes/api/profile");
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
  .then((res) => console.log("DB connnected successfully!"))
  .catch((err) => console.log("DB connection failed"));

app.get("/", (req, res) => res.send("HELLO!"));
app.use("/api/users", users);
app.use("/api/posts", posts);
app.use("/api/profile", profile);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
