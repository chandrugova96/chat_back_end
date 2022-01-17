// routes/message.js

"use strict";

const serviceLocator = require("../lib/service_locator");
const messageService = serviceLocator.get("messageService");
const failAction = serviceLocator.get("failAction");
const trimRequest = serviceLocator.get("trimRequest");
const tokenVerify = serviceLocator.get("tokenVerify");

exports.routes = (server, serviceLocator) => {
  return server.route([
    {
      path: "/message",
      method: "GET",
      handler: messageService.get,
      options: {
        auth: false,
        pre: [trimRequest],
        validate: {
          query: require("../validations/message/get"),
          failAction: failAction,
        }
      }
    },
    {
      path: "/message",
      method: "POST",
      handler: messageService.create,
      options: {
        auth: false,
        pre: [trimRequest],
        validate: {
          payload: require("../validations/message/create"),
          failAction: failAction,
        }
      }
    },
    {
      path: "/message",
      method: "PUT",
      handler: messageService.update,
      options: {
        auth: false,
        pre: [trimRequest, tokenVerify],
        validate: {
          payload: require("../validations/message/update"),
          failAction: failAction,
        }
      }
    },
    {
      path: "/message",
      method: "DELETE",
      handler: messageService.delete,
      options: {
        auth: false,
        pre: [trimRequest],
        validate: {
          query: require("../validations/message/delete"),
          failAction: failAction,
        }
      }
    },
    {
      path: "/contacts",
      method: "GET",
      handler: messageService.getContacts,
      options: {
        auth: false,
        pre: [trimRequest, tokenVerify]
      }
    },
  ]);
};
