const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose").default;

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  // Spots are curated, so someone has to be allowed to curate them. This replaces the
  // per-document `author` ownership the course teaches on campgrounds: the question for a
  // spot is "are you staff", not "did you create this one". Promote an account by hand in
  // the database (or with the seed script's --admin flag) — there is deliberately no route
  // that grants this.
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// usernameQueryFields adds 'email' alongside the default 'username' field, so
// findByUsername() (used by login + deserializeUser) matches on either one.
UserSchema.plugin(passportLocalMongoose, {
  usernameQueryFields: ["email"],
});

// hash/salt being `select: false` only protects queries (find/findById) — a document
// that was just fetched *with* them (login) or just had setPassword() called on it
// (register) still carries them in memory. Strip them here so no response path, now
// or later, can leak them via res.json({ user }).
UserSchema.set("toJSON", {
  transform: (doc, ret) => {
    delete ret.hash;
    delete ret.salt;
    return ret;
  },
});

module.exports = mongoose.model("User", UserSchema);
