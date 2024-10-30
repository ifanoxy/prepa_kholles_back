import Database from "./Database/Database";
import Logger from "./Logger";

export default class Server {
    public database: Database;
    public log: Logger;

    constructor() {
        this.database = new Database(this);
        this.log = new Logger();
    }

    async init()
    {
        this.log.info("Lancement du serveur en cours...")
        await this.database.authenticate();
        await this.database.loadTables();
        await this.database.loadManagers();
    }
}
