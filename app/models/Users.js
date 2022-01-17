"use strict";

const serviceLocator = require("../lib/service_locator");
const mongoose = serviceLocator.get("mongoose");
const bcrypt = serviceLocator.get("bcrypt");

var usersSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: [true, "userId is required"]
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      minlength: 3,
      maxlength: 50
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      index : true
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
  },
  {
    timestamps: true,
  }
);

// Hash password before saving
usersSchema.pre("save", function (next) {

  var user = this;

  if (!user.isModified("password")) return next();

  bcrypt.hash(user.password, 10, (err, hash) => {
    if (err) {
      return next(err);
    }
    user.password = hash;
    next();
  });

});

usersSchema.methods.login = async function (password) {
  return await bcrypt.compare(password, this.password).then(async (isValid) => {
    return isValid;
  });
};

module.exports = mongoose.model("Users", usersSchema);
