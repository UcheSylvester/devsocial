const JWTPassport = require("passport-jwt");
const mongoose = require("mongoose");
const User = mongoose.model("users");

const keys = require("./keys");
const passport = require("passport");

const { Strategy, ExtractJwt } = JWTPassport;
const { secretOrKey } = keys;

const strategyOptions = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey,
};

module.exports = (passport) => {
  passport.use(
    new Strategy(strategyOptions, (jwt_payload, done) => {
      const { id } = jwt_payload;

      User.findById(id)
        .then((user) => {
          // console.log({ user });

          if (user) return done(null, user);

          return done(null, false);
        })
        .catch((err) => console.log({ err }));
    })
  );
};
