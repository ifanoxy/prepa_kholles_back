import Database from "./Database/Database";
import Logger from "./Logger";
import {App} from "./App";
import {DiscordClient} from "./Discord";
import {Config} from "./Config";

export default class Server {
    public database: Database;
    public log: Logger;
    public app: App;
    public discord: DiscordClient | null;
    public config: Config;

    constructor() {
        this.database = new Database(this);
        this.log = new Logger();
        this.config = new Config();
        this.discord = process.env.DISCORD_TOKEN ? new DiscordClient(this) : null;
        this.app = new App(this);
    }

    async init()
    {
        this.log.info("Lancement du serveur en cours...")
        await this.database.authenticate();
        await this.database.loadTables();
        await this.database.loadManagers();

        if (this.discord)
            await this.discord.init();

        await this.app.init();
    }
}
