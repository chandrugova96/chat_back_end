"use strict";

const serviceLocator = require("../lib/service_locator");
const log = serviceLocator.get("logger");
const mongoose = serviceLocator.get("mongoose");
const Users = mongoose.model("Users");
const jsend = serviceLocator.get("jsend");
const config = require("../configs/configs")();
const jwt = serviceLocator.get("Jwt");

class AuthService {

    async exists(req, h) {
        const { email } = req.payload;
        const user = await Users.findOne({ email });
        const message = `User with email - ${email}`;
        if (user) {
            return h.notAcceptable(message + ` already exists`);
        }
        log.info(message + ` not found`);
        return jsend(200, `User not found`, message + ` not found`);
    }

    async get(req, h) {
        let ctr = {};
        if (req.query && req.query.search) {
            ctr = {
                $or: [
                    { email: { $regex: req.query.search, $options: "$i" } },
                    { userId: { $regex: req.query.search, $options: "$i" } },
                    { name: { $regex: req.query.search, $options: "$i" } }
                ]
            }
        }
        try {
            const user = await Users.find(ctr, { userId : 1, name : 1, email : 1, _id : 1 });
            if (!user.length) return jsend (404,'user Not Found!.');
            log.info("User fetched Successfully");
            return jsend(200, "User fetched Successfully", user);
        } catch (e) {
            log.info(e);
            log.info("User fetched failed");
            h.notAcceptable("User fetched failed");
        }
    }

    async signup(req, h) {
        let newUser = new Users(req.payload);
        try {
            newUser.status = true;
            newUser = await newUser.save();
            log.info("User Created Successfully");
            return jsend(200, "User Created Successfully", newUser);
        } catch (e) {
            log.error(e);
            log.error("User Created failed");
            h.notAcceptable(e);
        }
    }

    async signin(req, h) {
        let { email, password } = req.payload;

        try {
            const user = await Users.findOne({ email });
            if (!user) {
                log.info(`User not found for the email:  ${email}`);
                return {
                    statusCode: 404,
                    message: `User not found for the email:  ${email}`
                };
            }

            const isValid = await new Users(user).login(password);
            if (!isValid) {
                log.info(`Invalid Password`);
                return {
                    statusCode: 400,
                    message: `Invalid Password`
                };
            }

            const jwtToken = await jwt.createToken(user);
            const expires_in = Math.floor(new Date().getTime() / 1000) + Number(config.jwt.expiration);

            return {
                statusCode: 200,
                message: `User loggedIn Successfully`,
                expires_in: expires_in,
                expires_seconds: config.jwt.expiration,
                token: jwtToken
            };
        } catch (e) {
            log.error(e);
            log.error("User signin failed");
            h.notAcceptable("User signin failed");
        }
    }

    async signout(req, h) {
        let { email } = req.query;
        try {
            const user = await Users.findOne({ email });
            if (!user) {
                log.info(`User not found for the email:  ${email}`);
                return h.notFound(`User not found for the email:  ${email}`);
            }
            await jwt.destroyToken(
                req.headers.authorization
            );
            log.info(`User logout Successfully`);
            return jsend(200, `User logout Successfully`, null);
        } catch (e) {
            log.error(e);
            log.error("User signout failed");
            h.notAcceptable(e);
        }
    }

}

module.exports = AuthService;
