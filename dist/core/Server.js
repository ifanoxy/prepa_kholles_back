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
const mistralai_1 = require("@mistralai/mistralai");
class Server {
    constructor() {
        this.log = new Logger_1.default();
        this.database = new Database_1.default(this);
        this.config = new Config_1.Config();
        this.discord = process.env.DISCORD_TOKEN ? new Discord_1.DiscordClient(this) : null;
        this.app = new App_1.App(this);
        this.mistral = new mistralai_1.Mistral({
            apiKey: process.env.API_TOKEN_MISTRAL_AI,
        });
        this.mistral_tokens = {
            remaining: 32000000,
            total: 32000000,
        };
    }
    async init() {
        this.log.info("Lancement du serveur en cours...");
        await this.database.loadTables();
        await this.database.loadManagers();
        if (this.discord)
            await this.discord.init();
        await this.app.init();
        executeDaily(() => {
            this.mistral_tokens = {
                remaining: 32000000,
                total: 32000000,
            };
        });
    }
}
exports.default = Server;
function executeDaily(task, initialDelay = 0) {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const delay = midnight.getTime() - now.getTime();
    if (delay <= 0) {
        const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 0, 0, 0, 0);
        const nextDelay = nextMidnight.getTime() - now.getTime();
        setTimeout(() => {
            executeDaily(task, nextDelay);
        }, nextDelay);
    }
    else {
        setTimeout(() => {
            task();
            executeDaily(task, 24 * 60 * 60 * 1000);
        }, delay + initialDelay);
    }
}
