"use strict";

const serviceLocator = require("../lib/service_locator");
const jsonwebtoken = serviceLocator.get("jsonwebtoken");
const mongoose = serviceLocator.get("mongoose");
const Sessions = mongoose.model("Sessions");
const config = require("../configs/configs")();

class Jwt {
  constructor() {}

  async createToken(entity) {
    const GUID = new Date().getTime();
    const session = new Sessions({
      email: entity.email,
      id: entity._id,
      auth: GUID,
      valid: true
    });

    await session.save();

    return jsonwebtoken.sign(
      { 
        email: entity.email, 
        id: entity._id, 
        auth: GUID,
        name : entity.name
      },
      config.jwt.secretKey,
      {
        algorithm: config.jwt.algorithms,
        expiresIn: Number(config.jwt.expiration),
      }
    );
  }

  async destroyToken(token) {
    var decoded = false;
    try {
      decoded = jsonwebtoken.verify(token.split(" ")[1], config.jwt.secretKey);
    } catch (e) {
      decoded = false;
    }

    if (decoded) {
      let updated;
      const session = await Sessions.findOne({ auth : decoded.auth });
      updated = session;
      updated.valid = false;
      return await Sessions.updateOne(
        {
          auth : decoded.auth ,
        },
        updated
      ).then((result) => {
        return updated.valid;
      });
    } else {
      return true;
    }
  }

}

module.exports = Jwt;
