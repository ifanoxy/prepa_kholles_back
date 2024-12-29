import Database from "./Database/Database";
import Logger from "./Logger";
import {App} from "./App";
import {UserPermissions} from "../types/UserPermissions";

export default class Server {
    public database: Database;
    public log: Logger;
    public app: App;

    constructor() {
        this.log = new Logger();
        while (true)
        {
            console.log("ajzdoi")
        }
        this.app = new App(this);
        this.database = new Database(this);
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
