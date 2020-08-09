const express = require("express");
const passport = require("passport");

const Profile = require("../../models/Profile.model");
const validateProfile = require("../../validation/profile.validator");
const validateExperienceInput = require("../../validation/experience.validator");
const validateEducationInput = require("../../validation/education.validator");
const User = require("../../models/Users.model");

const router = express.Router();

const formatToObject = (args) => {
  return args.reduce((acc, field) => {
    const entries = Object.entries(field);

    const values = entries.reduce(
      (acc, [key, value]) => value && { [key]: value },
      {}
    );

    // console.log({ values });

    return { ...acc, ...values };
  }, {});
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

    const errors = {};

    Profile.findOne({ user: user.id })
      .populate("user", ["name", "avatar", "email", "date"])
      .then((profile) => {
        if (!profile) {
          errors.profile = "There is no profile for this user";
          return res.status(404).json({ errors });
        }

        return res.json({ message: "success", profile });
      })
      .catch((err) => res.status(500).json(err));
  }
);

/***
 * @route   GET api/profile/handle/:handle
 * @desc    GET profile by handle
 * @access  Public
 */
router.get("/handle/:handle", (req, res) => {
  const { handle } = req.params;

  const errors = {};

  Profile.findOne({ handle })
    .populate("user")
    .then((profile) => {
      if (!profile) {
        errors.profile = "No profile exists to this handle";
        return res.status(404).json({ errors });
      }

      return res.json({ message: "success", profile });
    })
    .catch((err) => res.status(500).json({ err }));
});

/***
 * @route   GET api/profile/:id
 * @desc    GET profile by id
 * @access  Public
 */
router.get("/:id", (req, res) => {
  const { id } = req.params;

  console.log({ id });

  const errors = {};

  Profile.findOne({ _id: id })
    .populate("user")
    .then((profile) => {
      if (!profile) {
        errors.profile = "No profile found";
        return res.status(404).json({ errors });
      }

      return res.json({ message: "success", profile });
    })
    .catch((error) => res.status(500).json({ error }));
});

/***
 * @route   POST api/profile/all
 * @desc    GET all profiles
 * @access  Public
 */
router.get("/all", (req, res) => {
  const errors = {};

  Profile.find()
    .populate("user")
    .then((profiles) => {
      if (!profiles) {
        errors.profile = "No profiles created yet";
        return res.status(404).json({ errors });
      }

      return res.json({ message: "success", profiles });
    })
    .catch((error) => res.status(500).json({ error }));
});

/***
 * @route   POST api/profile
 * @desc    create and edit user profile
 * @access  Private
 */
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { user, body } = req;
    const { id } = user;

    const { errors, isValid } = validateProfile(req.body);

    if (!isValid) return res.status(400).json({ errors });

    let {
      handle,
      company,
      location,
      status,
      skills,
      experience,
      education,
      bio,
      github_username,
      youtube,
      twitter,
      facebook,
      linkedin,
      instagram,
    } = body;

    skills = skills.split(",");

    const social = formatToObject([
      { youtube },
      { twitter },
      { facebook },
      { linkedin },
      { instagram },
    ]);

    const profileFields = {
      user,
      ...formatToObject([
        { handle },
        { company },
        { location },
        { status },
        { bio },
      ]),
      github_username,
      social,
      skills,
      experience: experience || [],
      education: education || [],
    };

    // CHECK IF PROFILE WAS ALREADY EXISTING AND UPDATE OR CREATE A NEW PROFILE
    Profile.findOne({ user: id }).then((profile) => {
      // console.log({ profile });

      if (profile) {
        // UPDATE
        Profile.findOneAndUpdate(
          { user: id },
          { $set: profileFields },
          { new: true }
        )
          .populate("user")
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
            return res.status(400).json({ errors });
          }

          new Profile(profileFields)
            .save()
            .then((profile) =>
              res.json({ message: "Profile created successfully!", profile })
            );
        });
      }
    });
  }
);

/***
 * @route   POST api/profile/exprience
 * @desc    add experience to profile
 * @access  Private
 */
router.post(
  "/experience",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateExperienceInput(req.body);

    if (!isValid) return res.status(500).json({ errors });

    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar", "email", "date"])
      .then((profile) => {
        if (!profile)
          return res.status(404).json({ message: "No profile found" });

        const {
          title,
          company,
          location,
          to,
          from,
          current,
          description,
        } = req.body;

        const newExperience = {
          title,
          company,
          location,
          to,
          from,
          current,
          description,
        };

        console.log({ newExperience });

        profile.experience.unshift(newExperience);

        profile
          .save()
          .then((profile) =>
            res.json({ message: "experience saved successfully", profile })
          );
      })
      .catch((error) => res.status(500).json({ error }));
  }
);

/***
 * @route   POST api/profile/education
 * @desc    add education to profile
 * @access  Private
 */
router.post(
  "/education",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { errors, isValid } = validateEducationInput(req.body);

    if (!isValid) return res.status(500).json({ errors });

    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar", "email", "date"])
      .then((profile) => {
        if (!profile)
          return res.status(404).json({ message: "No profile found" });

        const {
          school,
          degree,
          location,
          to,
          from,
          current,
          description,
          field_of_study,
        } = req.body;

        const newEducation = {
          school,
          degree,
          location,
          to,
          from,
          current,
          description,
          field_of_study,
        };

        profile.education.unshift(newEducation);

        profile
          .save()
          .then((profile) =>
            res.json({ message: "education saved successfully", profile })
          );
      })
      .catch((error) => res.status(500).json({ error }));
  }
);

/***
 * @route   DELETE api/profile/education/:id
 * @desc    delete education from profile
 * @access  Private
 */
router.delete(
  "/education/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const {
      params: { id },
    } = req;

    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar", "email", "date"])
      .then((profile) => {
        if (!profile)
          return res.status(404).json({ message: "No profile found" });

        const modifiedEducation = profile.education.filter(
          (education) => education.id !== id
        );

        profile.education = modifiedEducation;

        console.log({ modifiedEducation });

        profile
          .save()
          .then((profile) =>
            res.json({ message: "education deleted successfully", profile })
          );
      })
      .catch((error) => res.status(500).json({ error }));
  }
);

/***
 * @route   DELETE api/experience/:id
 * @desc    delete experience from profile
 * @access  Private
 */
router.delete(
  "/experience/:id",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const {
      params: { id },
    } = req;

    Profile.findOne({ user: req.user.id })
      .populate("user", ["name", "avatar", "email", "date"])
      .then((profile) => {
        if (!profile)
          return res.status(404).json({ message: "No profile found" });

        const modifiedExperience = profile.experience.filter(
          (experience) => experience.id !== id
        );

        profile.experience = modifiedExperience;

        // console.log({ modifiedExperience });

        profile
          .save()
          .then((profile) =>
            res.json({ message: "experience deleted successfully", profile })
          );
      })
      .catch((error) => res.status(500).json({ error }));
  }
);

/***
 * @route   DELETE api/profile
 * @desc    delete user and profile
 * @access  Private
 */
router.delete(
  "/",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const {
      user: { id },
    } = req;

    // find and remove the profile then remove the user also while doing that
    Profile.findOneAndRemove({ user: id })
      .then(() => {
        User.findOneAndRemove({ _id: id })
          .then(() => res.json({ message: "User deleted successfully" }))
          .catch((error) =>
            res
              .status(500)
              .json({ message: "An error occurred while deleting user", error })
          );
      })
      .catch((error) =>
        res
          .status(500)
          .json({ message: "An error occurred while deleting profile", error })
      );
  }
);

module.exports = router;
