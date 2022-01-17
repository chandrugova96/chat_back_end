"use strict";

const serviceLocator = require("../../lib/service_locator");
const joi = serviceLocator.get("joi");

module.exports = joi.object({
  senderId: joi.string().optional(),
  receiverId: joi.string().optional(),
  id: joi.string().optional(),
});