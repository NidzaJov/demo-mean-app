const mongoose = require("mongoose");
const uniqueValidator = require('mongoose-unique-validator');

const userSchema = mongoose.Schema({
  firstName: { type: String },
  lastName: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  imagePath: { type: String },
  role: { type: String, required: true },
  verificationToken: String,
  verified: Date,
  resetToken: {
    token: String,
    expires: Date
  },
  passwordReset: Date,
  created: { type: Date, default: Date.Now},
  updated: Date
});

userSchema.plugin(uniqueValidator);

userSchema.virtual('isVerified').get(function() {
  return !!(this.verified || this.passwordReset)
})

userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
})

module.exports = mongoose.model("User", userSchema);
