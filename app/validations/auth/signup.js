"use strict";

const serviceLocator = require("../../lib/service_locator");
const joi = serviceLocator.get("joi");

module.exports = joi.object({
  userId: joi.string().required(),
  name: joi.string().trim().min(3).max(50).required(),
  email: joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net", "co", "in"] },
  }).required(),
  password: joi.string().regex(new RegExp("^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])(?=.{8,})")).required()
});