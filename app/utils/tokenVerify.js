"use strict";

const serviceLocator = require("../lib/service_locator");
const jsonwebtoken = serviceLocator.get("jsonwebtoken");
const config = require("../configs/configs")();

var verify = async function (req, res, next) {
  var decoded = false;
  if (req.headers && req.headers.authorization) {
    try {
      decoded = jsonwebtoken.verify(req.headers.authorization.split(" ")[1], config.jwt.secretKey);
    } catch (e) {
      decoded = false;
    }
    if (!decoded || !decoded.auth) {
      return res
      .response({
        statusCode: 401,
        message: "Access Denied"
      })
      .code(401)
      .takeover();
    } else {
      req.user = decoded;
      return req;
    }
  }else{
    return res
    .response({
      statusCode: 401,
      message: "Access Denied"
    })
    .code(401)
    .takeover();
  }
};

module.exports = {
  verify,
};
