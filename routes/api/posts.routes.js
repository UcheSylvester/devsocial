const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");

const Post = require("../../models/Post.model");
const validatePostInput = require("../../validation/post.validator");
const ProfileModel = require("../../models/Profile.model");

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
 * @desc    get posts
 * @access  Public
 */
router.get("/", (req, res) => {
  Post.find()
    .sort({ date: -1 })
    .populate({ path: "likes", populate: { path: "user" } })
    .then((posts) => res.json({ message: "success", posts }))
    .catch((error) => res.status(404).json({ message: "no post found" }));
});

/***
 * @route   GET api/posts/:post_id
 * @desc    get post
 * @access  Public
 */
router.get("/:post_id", (req, res) => {
  const {
    params: { post_id },
  } = req;

  Post.findOne({ _id: post_id })
    .populate({ path: "likes", populate: { path: "user" } })
    .then((post) => {
      if (!post) return res.status(404).json({ message: "post not found" });

      return res.json({ message: "success", post });
    })
    .catch((error) => {
      console.log({ error });
      res.status(404).json({ message: "no post found" });
    });
});

/***
 * @route   POST api/posts
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
      .then((post) => res.json({ message: "success", post }))
      .catch(() => res.status(400).json({ message: "couldn't create post" }));
  }
);

/***
 * @route   DELETE api/posts
 * @desc    DELETE post
 * @access  Private
 */
router.delete(
  "/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const {
      params: { post_id },
      user: { id },
    } = req;

    ProfileModel.findOne({ user: id })
      .then((profile) => {
        Post.findById(post_id)
          .then((post) => {
            if (profile.user.toString() !== id)
              return res.status(401).json({ message: "User not authorized" });

            post
              .remove()
              .then(() => res.json({ message: "post deleted successfully" }));
          })
          .catch((err) => {
            console.log({ err });
            res.status(404).json({ message: "post not found" });
          });
      })
      .catch((err) => res.status(404).json({ message: "user not found" }));
  }
);

/***
 * @route   POST api/posts/like
 * @desc    like post
 * @access  Private
 */
router.post(
  "/like/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const {
      params: { post_id },
      user: { id },
    } = req;

    ProfileModel.findOne({ user: id })
      .populate("user")
      .then((profile) => {
        Post.findById(post_id)
          .populate({ path: "likes", populate: { path: "user" } })
          .then((post) => {
            // check if user has already liked post
            if (post.likes.find((like) => like.user._id.toString() === id))
              return res
                .status(400)
                .json({ message: "user already liked this post" });

            post.likes.unshift({ user: profile.user });

            post
              .save()
              .then((post) =>
                res.json({ message: "Post liked successfully", post })
              )
              .catch((err) => {
                console.log({ err });

                res.status(500).json(err);
              });
          })
          .catch((err) => {
            console.log({ err });
            res.status(404).json({ message: "post not found" });
          });
      })
      .catch((err) => {
        console.log({ err });
        res.status(404).json({ message: "user not found" });
      });
  }
);

module.exports = router;
