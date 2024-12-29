"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Database_1 = __importDefault(require("./Database/Database"));
const Logger_1 = __importDefault(require("./Logger"));
const App_1 = require("./App");
class Server {
    constructor() {
        this.database = new Database_1.default(this);
        this.log = new Logger_1.default();
        this.app = new App_1.App(this);
    }
    async init() {
        this.log.info("Lancement du serveur en cours...");
        await this.database.authenticate();
        await this.database.loadTables();
        await this.database.loadManagers();
        this.app.init();
    }
}
exports.default = Server;
