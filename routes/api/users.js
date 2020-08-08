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
 * @desc    Register user
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
      return res.status(406).json({ email: "Email already exist" });
    }

    // creating a new User using the User Schema
    const newUser = new User({
      name,
      email,
      avatar,
      password,
    });

    // generating bcrypt salt for hashing password
    bcryptjs.genSalt(10, (err, salt) => {
      bcryptjs.hash(newUser.password, salt, (error, hash) => {
        if (error) throw error;

        // setting the password on the new user to be saved to the generated hash from bcrypt
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
  });
});

/***
 * @route   GET api/users/loginb
 * @desc    Login user returing JWT token
 * @access  Public
 */

router.post("/login", (req, res) => {
  const { email, password } = req.body;

  // find user using the email
  User.findOne({ email }).then((user) => {
    if (!user) return res.status(404).json({ message: "user not found" });

    // when user exists, match the pasword entered with the password saved
    bcryptjs.compare(password, user.password).then((isMatched) => {
      if (isMatched) return res.json({ message: "success" });

      return res.status(406).json({ password: "Incorrect password" });
    });
  });
});

module.exports = router;
