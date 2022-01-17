"use strict";

const serviceLocator = require("../../lib/service_locator");
const joi = serviceLocator.get("joi");

module.exports = joi.object({
  email: joi.string().email({
    minDomainSegments: 2,
    tlds: { allow: ["com", "net", "co", "in"] },
  }).required()
});