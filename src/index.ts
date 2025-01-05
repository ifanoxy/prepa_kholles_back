import "dotenv/config"
import "./types/declare/main"
import Server from "./core/Server";

new Server().init();


process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

process.on("uncaughtException", (error) => {
    console.error("Uncaught Exception thrown", error);
});