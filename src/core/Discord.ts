import {Client, Constants} from "eris";
import Server from "./Server";
import {Handler} from "./DiscordClient/Handler";
const { guilds, guildMessages, messageContent } = Constants.Intents;

export class DiscordClient extends Client {
    public handler: Handler;
    constructor(public server: Server) {
        super(process.env.DISCORD_TOKEN as string, {
            intents: [guilds, guildMessages, messageContent]
        });
        this.handler = new Handler(this);
    }

    public async init() {
        this.handler.loadEvents();
        this.handler.loadCommands();
        this.handler.loadSelect();
        this.server.log.info("[DiscordClient] Connexion à Discord en cours...");
        await this.connect().catch(() =>
            this.server.log.warn("[DiscordClient] La connexion à discord à échoué")
        );
        this.server.log.info("[DiscordClient] Connecté à discord");
    }

    public async loadCommands() {
        for (let command of this.handler.commands.values()) {
            const res = await this.createCommand(command.data);
            this.server.log.debug(`[DiscordClient] Commande ${res.name} (${res.id}) chargée`);
        }
    }
}