require("dotenv").config();
const config = require("./app/configs/configs")();
const Hapi = require("@hapi/hapi");
const glob = require("glob");
const Qs = require("qs");
const path = require("path");
const decorator = require("hapi-boom-decorators");

const serviceLocator = require("./app/configs/di");
const logger = serviceLocator.get("logger");

// Initialize the database
const Database = require("./app/configs/database");
new Database(
    config.mongo.port,
    config.mongo.host,
    config.mongo.dbname,
    config.mongo.username,
    config.mongo.password
);

const server = Hapi.server({
    port: config.app.port,
    query: {
        parser: (query) => Qs.parse(query),
    },
    routes: {
        cors: {
            origin: ['*']
        }
    },
});

const main = async () => {
    // Setup Error Decorator Handling
    await server.register(decorator);

    var io = require('socket.io')(server.listener,{
        transports: ['polling'],
        cors: {
            cors: {
                origin: process.env.ORIGIN
            }
        }
    });
    io.on("connection", (socket) => {
        logger.info("Socket Connection was Successful")
    });
    global.io = io;

    glob.sync("./app/routes/**.js", {
        root: __dirname,
    }).forEach(async (file) => {
        const route = require(path.join(__dirname, file));
        await route.routes(server, serviceLocator);
    });

    await server.start();
    console.log("Server running on %s", server.info.uri);
    return server;
};

main().then((server) => {
    console.log("Server running at:", server.info.uri);
}).catch((err) => {
    console.log(err);
    process.exit(1);
});
