"use strict";

const serviceLocator = require("../lib/service_locator");
const log = serviceLocator.get("logger");
const mongoose = serviceLocator.get("mongoose");
const Messages = mongoose.model("Messages");
const jsend = serviceLocator.get("jsend");
const _ = serviceLocator.get("_");

async function asyncForEach(array, callback) {
    for (let index = 0; index < array.length; index++) {
        await callback(array[index], index, array);
    }
}

class MessageService {

    async get(req, h) {
        let { senderId, receiverId, _id, _start, _limit } = req.query;
        let ctr = {};
        if (senderId && receiverId) {
            ctr = {
                $or: [
                    {
                        senderId: mongoose.Types.ObjectId(senderId),
                        receiverId: mongoose.Types.ObjectId(receiverId)
                    },
                    {
                        receiverId: mongoose.Types.ObjectId(senderId),
                        senderId: mongoose.Types.ObjectId(receiverId)
                    }
                ]
            }
        } else if (senderId && !receiverId) {
            ctr['senderId'] = mongoose.Types.ObjectId(senderId);
        } else if (!senderId && receiverId) {
            ctr['receiverId'] = mongoose.Types.ObjectId(receiverId);
        }
        if (_id) ctr['_id'] = mongoose.Types.ObjectId(_id);
        _start = _start ? _start : 0;
        _limit = _limit ? _limit : 100000;

        try {
            let messages = await Messages.aggregate([
                {
                    $match: ctr,
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "senderId",
                        foreignField: "_id",
                        as: "sender",
                    },
                },
                {
                    $unwind: "$sender"
                },
                {
                    $lookup: {
                        from: "users",
                        localField: "receiverId",
                        foreignField: "_id",
                        as: "receiver",
                    },
                },
                {
                    $unwind: "$receiver"
                },
                {
                    $project: {
                        "senderId": 1,
                        "receiverId": 1,
                        "message": 1,
                        "isViewed": 1,
                        "createdAt": 1,
                        "updatedAt": 1,
                        "senderName": "$sender.name",
                        "receiverName": "$receiver.name",
                        "senderEmail": "$sender.email",
                        "receiverEmail": "$receiver.email",
                        "senderUserId": "$sender.userId",
                        "receiverUserId": "$receiver.userId",
                    }
                },
                {
                    $sort: {
                        createdAt: 1
                    }
                },
                {
                    "$limit": _limit
                },
                {
                    "$skip": _start
                }
            ]);

            if (!messages.length) return h.notFound("Messages not found");
            log.info("Messages fetched Successfully");
            return jsend(200, "Messages fetched Successfully", messages);

        } catch (e) {
            log.info(e);
            log.info("Messages fetched failed");
            h.notAcceptable(e);
        }
    }

    async create(req, h) {
        let newMessage = new Messages(req.payload);
        try {
            newMessage.isViewed = false;
            newMessage = await newMessage.save();
            io.emit('message', newMessage);
            log.info("Message Created Successfully");
            return jsend(200, "Message Created Successfully", newMessage);
        } catch (e) {
            log.error(e);
            log.error("Message Created failed");
            h.notAcceptable(e);
        }
    }

    async update(req, h) {
        let { senderId, receiverId, _id, message, isViewed } = req.query;

        let ctr = {};
        if (senderId) ctr['senderId'] = mongoose.Types.ObjectId(senderId);
        if (receiverId) ctr['receiverId'] = mongoose.Types.ObjectId(receiverId);
        if (_id) ctr['_id'] = mongoose.Types.ObjectId(_id);

        let update = {};
        if (message) update['message'] = message;
        if (isViewed) update['isViewed'] = isViewed;

        try {
            if (Object.keys(ctr).length > 0 && Object.keys(update).length > 0) {
                await Messages.update(
                    ctr,
                    { $set: update }
                )
                return jsend(200, "Message Updated Successfully");
            } else {
                log.info(`Please enter required values`);
                return h.badRequest(`Please enter required values`);
            }
        } catch (e) {
            log.error(e);
            log.error("Message Update failed");
            h.notAcceptable(e);
        }
    }

    async delete(req, h) {
        let id = mongoose.Types.ObjectId(req.query.id);
        try {
            await Messages.remove({ senderId: id });
            return jsend(200, "Message Deleted Successfully");
        } catch (e) {
            log.error(e);
            log.error("Message Deleted failed");
            h.notAcceptable(e);
        }
    }

    async getContacts(req, h) {
        let contacts = [];
        let sendUserArray = await Messages.aggregate([
            {
                $match: { senderId: mongoose.Types.ObjectId(req.user.id) },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "senderId",
                    foreignField: "_id",
                    as: "sender",
                },
            },
            {
                $unwind: "$sender"
            },
            {
                $lookup: {
                    from: "users",
                    localField: "receiverId",
                    foreignField: "_id",
                    as: "receiver",
                },
            },
            {
                $unwind: "$receiver"
            },
            {
                $project: {
                    "senderId": 1,
                    "receiverId": 1,
                    "message": 1,
                    "isViewed": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "senderName": "$sender.name",
                    "receiverName": "$receiver.name",
                    "senderEmail": "$sender.email",
                    "receiverEmail": "$receiver.email",
                    "senderUserId": "$sender.userId",
                    "receiverUserId": "$receiver.userId",
                }
            },
            {
                $sort: {
                    createdAt: 1
                }
            }
        ]);

        let receiveUserArray = await Messages.aggregate([
            {
                $match: { receiverId: mongoose.Types.ObjectId(req.user.id) },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "senderId",
                    foreignField: "_id",
                    as: "sender",
                },
            },
            {
                $unwind: "$sender"
            },
            {
                $lookup: {
                    from: "users",
                    localField: "receiverId",
                    foreignField: "_id",
                    as: "receiver",
                },
            },
            {
                $unwind: "$receiver"
            },
            {
                $project: {
                    "senderId": 1,
                    "receiverId": 1,
                    "message": 1,
                    "isViewed": 1,
                    "createdAt": 1,
                    "updatedAt": 1,
                    "senderName": "$sender.name",
                    "receiverName": "$receiver.name",
                    "senderEmail": "$sender.email",
                    "receiverEmail": "$receiver.email",
                    "senderUserId": "$sender.userId",
                    "receiverUserId": "$receiver.userId",
                }
            },
            {
                $sort: {
                    createdAt: 1
                }
            }
        ]);

        await asyncForEach(sendUserArray, async (oneDoc) => {
            let obj = {
                contactName: oneDoc.receiverName,
                contactId: oneDoc.receiverId,
                contactEmail: oneDoc.receiverEmail,
            }
            contacts.push(obj);
        });

        await asyncForEach(receiveUserArray, async (oneDoc) => {
            let obj = {
                contactName: oneDoc.senderName,
                contactId: oneDoc.senderId,
                contactEmail: oneDoc.senderEmail,
            }
            contacts.push(obj);
        });

        contacts = _.uniq(contacts, x => x.contactEmail);
        return jsend(200, "Contacts Created Successfully", contacts);
    }

}

module.exports = MessageService;
