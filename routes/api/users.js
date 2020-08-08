const express = require("express");
const gravatar = require("gravatar");
const bcryptjs = require("bcryptjs");

const User = require("../../models/Users");

const router = express.Router();

/***
 * @route   GET api/users/test
 * @desc    Test user route
 * @access  Public
 */
router.get("/test", (req, res) => {
  res.json({ message: "User works" });
});

/***
 * @route   GET api/users/register
 * @desc    Register user route
 * @access  Public
 */
router.post("/register", (req, res) => {
  const { email, name, password } = req.body;

  const avatar = gravatar.url(email, {
    s: "200",
    r: "pg",
    d: "mm",
  });

  // check if user already exists before registering
  User.findOne({ email }).then((user) => {
    if (user) {
      res.status(406).json({ email: "Email already exist" });
    } else {
      const newUser = new User({
        name,
        email,
        avatar,
        password,
      });

      // console.log({ newUser });

      bcryptjs.genSalt(10, (err, salt) => {
        bcryptjs.hash(newUser.password, salt, (error, hash) => {
          if (error) throw error;

          newUser.password = hash;
          newUser
            .save()
            .then((user) => res.json(user))
            .catch((err) => {
              console.log({ err });
              res.status(500);
            });
        });
      });
    }
  });
});

module.exports = router;
