const express = require("express");
const mongoose = require("mongoose");
const passport = require("passport");

const Post = require("../../models/Post.model");
const validatePostInput = require("../../validation/post.validator");
const ProfileModel = require("../../models/Profile.model");
const { json } = require("body-parser");

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
    // .populate("user", ["name", "avatar", "email", "date"])
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
    .populate({ path: "comments", populate: { path: "user" } })
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

    if (!isValid) return res.status(400).json({ errors });

    const {
      body: { text, name, avatar },
      user: { id },
    } = req;

    new Post({ text, name, avatar, user: id })
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
            // make sure it's the post creator that's deleting post
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

            // add user to like
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

/***
 * @route   POST api/posts/like
 * @desc    like post
 * @access  Private
 */
router.post(
  "/unlike/:post_id",
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
            // when user have not liked post initially, no need to unlike
            const userLikedPost = post.likes.find(
              (like) => like.user._id.toString() === id
            );

            if (!userLikedPost)
              return res.status(400).json({
                message: "You have not liked this post yet",
              });

            post.likes = post.likes.filter(
              (like) => like.user._id.toString() !== id
            );

            post
              .save()
              .then((post) =>
                res.json({ message: "Post unliked successfully", post })
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

/***
 * @route   POST api/posts/comments/:post_id
 * @desc    add comment to post
 * @access  Private
 */
router.post(
  "/comment/:post_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validatePostInput(req.body);

    if (!isValid) return res.status(400).json({ errors });

    const {
      body: { name, avatar, text },
      params: { post_id },
      user,
    } = req;

    const { id } = user;

    ProfileModel.findOne({ user: id })
      .then((profile) => {
        Post.findById(post_id)
          .then((post) => {
            post.comments = [
              {
                user: id,
                name,
                avatar,
                text,
              },
              ...post.comments,
            ];

            post
              .save()
              .then((post) =>
                res.json({ message: "Comment added successfully", post })
              );
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

/***
 * @route   DELETE api/posts/comments/:post_id/:comment_id
 * @desc    DELETE comment
 * @access  Private
 */
router.delete(
  "/comments/:post_id/:comment_id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const {
      params: { post_id, comment_id },
      user: { id },
    } = req;

    ProfileModel.findOne({ user: id })
      .then((profile) => {
        Post.findById(post_id)
          .then((post) => {
            // res.json({ post, profile, id });
            const { comments } = post;

            // find comment to delete and check if it really exists
            const commentToDelete = comments.find(
              (comment) => comment.id === comment_id
            );

            if (!commentToDelete)
              return res
                .status(400)
                .json({ message: "comment does not exist" });

            // check if the user attempting to delete comment is actually the creator
            if (commentToDelete.user.toString() !== id)
              return res.status(401).json({ message: "unauthorized" });

            post.comments = post.comments.filter(
              (comment) => comment.id.toString() !== comment_id
            );

            post
              .save()
              .then((post) =>
                res.json({ message: "comment deleted successfully!" })
              );

            // if(id === )
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
 * @route   GET api/posts/comments/:post_id
 * @desc    GET all comments on a post
 * @access  Public
 */

router.get("/comments/:post_id", (req, res) => {
  const {
    params: { post_id },
  } = req;

  Post.findById(post_id)
    .then(({ comments }) => {
      res.json({ message: "success", comments });
    })
    .catch((err) => {
      console.log({ err });
      res.status(404).json({ message: "post does not exist" });
    });
});

module.exports = router;
