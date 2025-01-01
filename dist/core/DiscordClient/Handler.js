"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Handler = void 0;
const fs_1 = __importDefault(require("fs"));
class Handler {
    constructor(client) {
        this.client = client;
        this.commands = new Map();
        this.select = new Map();
    }
    /**
     * Retourne tous les fichiers d'un dossier récurssivement
     * @param path
     */
    getFiles(path) {
        return fs_1.default.existsSync(path) ? fs_1.default
            .readdirSync(path)
            .map((x) => x.includes('.') ? path + '/' + x : this.getFiles(path + '/' + x))
            .flat() : [];
    }
    /**
     * Charge tous les events du client discord
     */
    loadEvents() {
        const files = this.getFiles('dist/core/DiscordClient/Events');
        for (const file of files) {
            const raw = require(process.cwd() + '/' + file).default;
            this.client.server.log.debug(`[DiscordClient] Chargement de l'event ${raw.name}`);
            this.client.on(raw.name, raw.execute.bind(null, this.client));
        }
    }
    /**
     * Charge tous les menu sélections du client discord
     */
    loadSelect() {
        const files = this.getFiles('dist/core/DiscordClient/Selects');
        for (const file of files) {
            const raw = require(process.cwd() + '/' + file).default;
            this.client.server.log.debug(`[DiscordClient] Chargement du menu sélectif ${raw.custom_id}`);
            this.select.set(raw.custom_id, raw);
        }
    }
    /**
     * Charge toute les commandes du client discord
     */
    loadCommands() {
        const files = this.getFiles('dist/core/DiscordClient/Commands');
        for (const file of files) {
            const raw = require(process.cwd() + '/' + file).default;
            this.client.server.log.debug(`[DiscordClient] Chargement de la commande ${raw.data.name}`);
            this.commands.set(raw.data.name, raw);
        }
    }
}
exports.Handler = Handler;
