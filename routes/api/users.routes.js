const express = require("express");
const gravatar = require("gravatar");
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");

const User = require("../../models/Users.model");
const keys = require("../../config/keys");

const validateRegisterInput = require("../../validation/register.validator");
const validateLoginInput = require("../../validation/login.validator");

const { secretOrKey } = keys;

const formatUser = (user) => {
  const { _id, name, email, avatar, date } = user;

  return {
    id: _id,
    name,
    email,
    avatar,
    date,
  };
};

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
 * @route   POST api/users/register
 * @desc    Register user
 * @access  Public
 */
router.post("/register", (req, res) => {
  const { email, name, password } = req.body;

  const { errors, isValid } = validateRegisterInput(req.body);

  if (!isValid) return res.status(400).json({ errors });

  const avatar = gravatar.url(email, {
    s: "200",
    r: "pg",
    d: "mm",
  });

  // check if user already exists before registering
  User.findOne({ email }).then((user) => {
    if (user) {
      errors.email = "Email already exist";

      return res.status(406).json({ errors });
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
      if (err) throw err;

      bcryptjs.hash(newUser.password, salt, (error, hash) => {
        if (error) throw error;

        // console.log({ hash });

        // setting the password on the new user to be saved to the generated hash from bcrypt
        newUser.password = hash;
        newUser
          .save()
          .then((user) =>
            res.json({
              message: "registration successful",
              user: formatUser(user),
            })
          )
          .catch((err) => {
            console.log({ err });
            res.status(500);
          });
      });
    });
  });
});

/***
 * @route   POST api/users/login
 * @desc    Login user returing JWT token
 * @access  Public
 */
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const { errors, isValid } = validateLoginInput(req.body);

  if (!isValid) return res.status(400).json({ errors });

  // find user using the email
  User.findOne({ email }).then((user) => {
    if (!user) return res.status(404).json({ message: "user not found" });

    // when user exists, match the pasword entered with the password saved
    bcryptjs.compare(password, user.password).then((isMatched) => {
      // user not matched
      if (!isMatched) {
        errors.password = "Incorrect password";
        return res.status(400).json({ errors });
      }
      //  if user matched, sign the JWT Token with a payload containing basic user info.
      // return token, user and a success message

      const { _id, name, avatar } = user;
      const payload = { id: _id, name, avatar };

      jwt.sign(
        payload,
        secretOrKey,
        { expiresIn: 3600 * 24 * 7 },
        (err, token) => {
          if (err) throw err;

          return res.json({
            message: "success",
            user: formatUser(user),
            token: `Bearer ${token}`,
          });
        }
      );
    });
  });
});

/***
 * @route   POST api/users
 * @desc    Return current user
 * @access  Private
 */
router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { user } = req;
    res.json({ message: "success", user: formatUser(user) });
  }
);

module.exports = router;
