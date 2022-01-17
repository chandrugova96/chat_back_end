"use strict";

const serviceLocator = require("../../lib/service_locator");
const joi = serviceLocator.get("joi");

module.exports = joi.object({
  search: joi.string().optional(),
});