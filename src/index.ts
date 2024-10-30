import "dotenv/config"
import "./types/declare/main"
import Server from "./core/Server";

new Server().init();
