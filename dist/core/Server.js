"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = __importDefault(require("./Database/Database"));
const Logger_1 = __importDefault(require("./Logger"));
const App_1 = require("./App");
const Discord_1 = require("./Discord");
const Config_1 = require("./Config");
class Server {
    constructor() {
        this.log = new Logger_1.default();
        this.database = new Database_1.default(this);
        this.config = new Config_1.Config();
        this.discord = process.env.DISCORD_TOKEN ? new Discord_1.DiscordClient(this) : null;
        this.app = new App_1.App(this);
    }
    async init() {
        this.log.info("Lancement du serveur en cours...");
        await this.database.loadTables();
        await this.database.loadManagers();
        if (this.discord)
            await this.discord.init();
        await this.app.init();
    }
}
exports.default = Server;
