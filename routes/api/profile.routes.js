const express = require("express");
const passport = require("passport");

const Profile = require("../../models/Profile.model");
const validateProfile = require("../../validation/profile.validator");

const router = express.Router();

/***
 * @route   GET api/profile/test
 * @desc    Test profile route
 * @access  Public
 */
router.get("/test", (req, res) => {
  res.json({ message: "Profile works" });
});

/***
 * @route   GET api/profile
 * @desc    Get user profile
 * @access  Private
 */

router.get(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { user } = req;

    const { errors, isValid } = validateProfile(req.body);

    console.log({ user });

    if (!isValid) return res.status(400).json({ errors });

    errors.noprofile = "There is no profile for this user";

    Profile.findOne({ user: user.id })
      .then((profile) => {
        if (!profile) return res.status(404).json({ errors });

        return res.json(profile);
      })
      .catch((err) => res.status(500).json(err));
  }
);

module.exports = router;
