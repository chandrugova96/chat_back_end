"use strict";

const serviceLocator = require("../lib/service_locator");
const mongoose = serviceLocator.get("mongoose");

var sessionSchema = new mongoose.Schema(
  {
    email: { 
      type: String, 
      required: true 
    },
    id: { 
      type: String, 
      required: true 
    },
    auth: { 
      type: String, 
      required: true 
    },
    valid: { 
      type: Boolean, 
      required: true 
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Sessions", sessionSchema);
