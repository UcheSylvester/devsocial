const express = require("express");
const passport = require("passport");

const Profile = require("../../models/Profile.model");
const validateProfile = require("../../validation/profile.validator");

const router = express.Router();

const checkIfItemExistWhenAddingToObject = (item) => item && { item };

const formatToObject = () => {
  console.log({ arguments });
  arguments.reduce(
    (acc, field) => ({ ...acc, ...checkIfItemExistWhenAddingToObject(field) }),
    {}
  );
};
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

    Profile.findOne({ user: user._id })
      .then((profile) => {
        if (!profile) return res.status(404).json({ errors });

        return res.json(profile);
      })
      .catch((err) => res.status(500).json(err));
  }
);

/***
 * @route   POST api/profile
 * @desc    create and edit user profile
 * @access  Private
 */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    console.log({ req });
    const {
      user: { id },
      body,
    } = req;

    const { errors, isValid } = validateProfile(req.body);

    if (!isValid) return res.status(400).json({ errors });

    let {
      handle,
      company,
      location,
      status,
      skills,
      experience,
      bio,
      github_username,
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram,
    } = body;

    skills = skills.split(",");

    const social = formatToObject(
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram
    );

    const profileFields = {
      user: id,
      ...formatToObject(
        handle,
        company,
        location,
        status,
        bio,
        github_username
      ),
      social,
      skills,
    };

    console.log({ profileFields, social, skills });

    // CHECK IF PROFILE WAS ALREADY EXISTING AND UPDATE OR CREATE A NEW PROFILE
    Profile.findOne({ user: id }).then((profile) => {
      if (profile) {
        // UPDATE
        Profile.findOneAndUpdate(
          { user: id },
          { $set: profileFields },
          { new: true }
        )
          .then((profile) =>
            res.json({ message: "Profile updated successfully!", profile })
          )
          .catch((err) => console.log({ err }));
      } else {
        // CREATE

        // check if handle exists
        Profile.findOne({ handle: profileFields.handle }).then((profile) => {
          if (profile) {
            errors.handle = "That handle already exists";
            res.status(400).json({ errors });
          }
        });

        new Profile(profileFields)
          .save()
          .then((profile) =>
            res.json({ message: "Profile created successfully!", profile })
          );
      }
    });
  }
);

module.exports = router;
