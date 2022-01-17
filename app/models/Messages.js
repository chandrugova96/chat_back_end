"use strict";

const serviceLocator = require("../lib/service_locator");
const mongoose = serviceLocator.get("mongoose");

var messagesSchema = new mongoose.Schema(
  {
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: [true, "SenderId is required"],
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: [true, "ReceiverId is required"],
    },
    message: {
      type: String,
      required: [true, "Message is required"]
    },
    isViewed : {
      type : Boolean,
      dufult : false
    }
  },
  {
    timestamps: true,
  }
);


module.exports = mongoose.model("Messages", messagesSchema);
