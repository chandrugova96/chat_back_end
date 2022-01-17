"use strict";

const serviceLocator = require("../../lib/service_locator");
const joi = serviceLocator.get("joi");

module.exports = joi.object({
  senderId: joi.string().required(),
  receiverId: joi.string().required(),
  message : joi.string().required()
});