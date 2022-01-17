"use strict";

const serviceLocator = require("../lib/service_locator");
const config = require("./configs")();

serviceLocator.register("logger", () => {
  return require("../lib/logger").create(config.application_logging);
});

serviceLocator.register("joi", () => {
  return require("joi");
});

serviceLocator.register("bcrypt", () => {
  return require("bcrypt");
});

serviceLocator.register("jsonwebtoken", () => {
  return require("jsonwebtoken");
});

serviceLocator.register("Jwt", () => {
  const Jwt = require("../utils/token");
  return new Jwt();
});

serviceLocator.register("jsend", () => {
  return require("../lib/jsend");
});

serviceLocator.register("failAction", () => {
  return require("../lib/failAction").verify;
});

serviceLocator.register("trimRequest", () => {
  return require("../utils/trimRequest").all;
});

serviceLocator.register("tokenVerify", () => {
  return require("../utils/tokenVerify").verify;
});

serviceLocator.register("mongoose", () => {
  return require("mongoose");
});

serviceLocator.register("fs", () => {
  return require("fs");
});

serviceLocator.register("path", () => {
  return require("path");
});


serviceLocator.register("glob", () => {
  return require("glob");
});

serviceLocator.register("_", () => {
  return require("underscore");
});

serviceLocator.register("authService", (serviceLocator) => {
  const AuthService = require("../services/auth");
  return new AuthService();
});

serviceLocator.register("messageService", (serviceLocator) => {
  const MessageService = require("../services/message");
  return new MessageService();
});

module.exports = serviceLocator;
