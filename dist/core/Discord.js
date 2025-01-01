"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DiscordClient = void 0;
const eris_1 = require("eris");
const Handler_1 = require("./DiscordClient/Handler");
const { guilds, guildMessages, messageContent } = eris_1.Constants.Intents;
class DiscordClient extends eris_1.Client {
    constructor(server) {
        super(process.env.DISCORD_TOKEN, {
            intents: [guilds, guildMessages, messageContent]
        });
        this.server = server;
        this.handler = new Handler_1.Handler(this);
    }
    async init() {
        this.handler.loadEvents();
        this.handler.loadCommands();
        this.handler.loadSelect();
        this.server.log.info("[DiscordClient] Connexion à Discord en cours...");
        await this.connect();
        this.server.log.info("[DiscordClient] Connecté à discord");
    }
    async loadCommands() {
        for (let command of this.handler.commands.values()) {
            const res = await this.createCommand(command.data);
            this.server.log.debug(`[DiscordClient] Commande ${res.name} (${res.id}) chargée`);
        }
    }
}
exports.DiscordClient = DiscordClient;
