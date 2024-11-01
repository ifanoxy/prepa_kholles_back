import Database from "./Database/Database";
import Logger from "./Logger";
import {App} from "./App";

export default class Server {
    public database: Database;
    public log: Logger;
    public app: App;

    constructor() {
        this.database = new Database(this);
        this.log = new Logger();
        this.app = new App(this);
    }

    async init()
    {
        this.log.info("Lancement du serveur en cours...")
        await this.database.authenticate();
        await this.database.loadTables();
        await this.database.loadManagers();
        this.app.init();
    }
}
