// routes/auth.js

"use strict";

const serviceLocator = require("../lib/service_locator");
const authService = serviceLocator.get("authService");
const failAction = serviceLocator.get("failAction");
const trimRequest = serviceLocator.get("trimRequest");

exports.routes = (server, serviceLocator) => {
  return server.route([
    {
      path: "/users",
      method: "GET",
      handler: authService.get,
      options: {
        auth: false,
        pre: [trimRequest],
        validate: {
          query: require("../validations/auth/get"),
          failAction: failAction,
        }
      }
    },
    {
      path: "/signup",
      method: "POST",
      handler: authService.signup,
      options: {
        auth: false,
        pre: [trimRequest, authService.exists],
        validate: {
          payload: require("../validations/auth/signup"),
          failAction: failAction,
        }
      }
    },
    {
      path: "/signin",
      method: "POST",
      handler: authService.signin,
      options: {
        auth: false,
        pre: [trimRequest],
        validate: {
          payload: require("../validations/auth/signin"),
          failAction: failAction,
        }
      }
    },
    {
      path: "/signout",
      method: "POST",
      handler: authService.signout,
      options: {
        auth: false,
        pre: [trimRequest],
        validate: {
          query: require("../validations/auth/signout"),
          failAction: failAction,
        }
      }
    },
  ]);
};
