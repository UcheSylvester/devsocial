const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const passport = require("passport")

const users = require("./routes/api/users.routes");
const posts = require("./routes/api/posts.routes");
const profile = require("./routes/api/profile.routes");
const keys = require("./config/keys");

const app = express();

// middlewares
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(passport.initialize())

// passport config
require("./config/passport")(passport)


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
  .catch((err) => console.log("DB connection failed", err));

app.get("/", (req, res) => res.send("HELLO!"));
app.use("/api/users", users);
app.use("/api/posts", posts);
app.use("/api/profile", profile);

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => console.log(`Server running on ${PORT}`));
