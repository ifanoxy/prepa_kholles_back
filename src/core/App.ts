import express, { Express } from "express";
import Server from "./Server";
import * as fs from "fs";

export class App {
    public app: Express;
    private server: Server;

    constructor(server: Server)
    {
        this.server = server;
        this.app = express();
    }

    public init()
    {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));

        this.app.listen(process.env.API_PORT, () => this.server.log.info(`L'API est sur écoute sur le port ${process.env.API_PORT}`))
    }

    public getFiles(path: string): string[]
    {
        let files: string[] = [];

        for (let file of fs.readdirSync(path))
        {
            if (file.includes("."))
                files.push(path + "/" + file);
            else
                files.concat(this.getFiles(path + "/" + file));
        }

        return files;
    }

    public loadRoutes()
    {

    }
}
