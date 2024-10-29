import Database from "./Database/Database";

export default class Server {
    public database: Database;

    constructor() {
        this.database = new Database(this);
    }

    async init()
    {
        await this.database.authenticate();
        await this.database.loadTables();
    }
}