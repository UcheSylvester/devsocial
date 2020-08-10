const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");

const Post = require("../../models/Post.model");
const validatePostInput = require("../../validation/post.validator");

const router = express.Router();

/***
 * @route   GET api/posts/test
 * @desc    Test posts route
 * @access  Public
 */
router.get("/test", (req, res) => {
  res.json({ message: "Posts works" });
});

/***
 * @route   GET api/posts
 * @desc    create post
 * @access  Private
 */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) return res.json({ errors });

    const {
      body: { text, name, avatar },
    } = req;

    new Post({ text, name, avatar })
      .save()
      .then((post) => res.json({ message: "post created successfully", post }))
      .catch(() => res.status(400).json({ message: "couldn't create post" }));
  }
);

module.exports = router;
