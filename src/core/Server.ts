import Database from "./Database/Database";
import Logger from "./Logger";
import {App} from "./App";
import {DiscordClient} from "./Discord";
import {Config} from "./Config";
import {Mistral} from "@mistralai/mistralai";

export default class Server {
    public database: Database;
    public log: Logger;
    public app: App;
    public discord: DiscordClient | null;
    public config: Config;
    public mistral: Mistral;
    public mistral_tokens: { total: number; remaining: number };

    constructor() {
        this.log = new Logger();
        this.database = new Database(this);
        this.config = new Config();
        this.discord = process.env.DISCORD_TOKEN ? new DiscordClient(this) : null;
        this.app = new App(this);
        this.mistral = new Mistral({
            apiKey: process.env.API_TOKEN_MISTRAL_AI,
        });
        this.mistral_tokens = {
            remaining: 32000000,
            total: 32000000,
        };
    }

    async init()
    {
        this.log.info("Lancement du serveur en cours...")
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

function executeDaily(task: () => void, initialDelay: number = 0) {
    const now = new Date();
    const midnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0);
    const delay = midnight.getTime() - now.getTime();

    if (delay <= 0) {
        const nextMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2, 0, 0, 0, 0);
        const nextDelay = nextMidnight.getTime() - now.getTime();
        setTimeout(() => {
            executeDaily(task, nextDelay);
        }, nextDelay);
    } else {
        setTimeout(() => {
            task();
            executeDaily(task, 24 * 60 * 60 * 1000);
        }, delay + initialDelay);
    }
}
