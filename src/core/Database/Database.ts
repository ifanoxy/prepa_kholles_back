import Server from "../Server";
import {createConnection, QueryResult, RowDataPacket} from "mysql2/promise";
import {Connection} from "mysql2/promise";
import Manager from "./Manager";
import {UsersKeys, UsersPrimaryKeys} from "../../types/schemas/Users";
import * as fs from "fs";
import {UserPermissions} from "../../types/UserPermissions";

export default class Database
{
    private connection: Connection | undefined;
    public users!: Manager<UsersPrimaryKeys, UsersKeys>;
    constructor(private readonly server: Server) {}

    /**
     * Permet de créer une connection avec la base de donnée
     */
    public async authenticate(): Promise<void>
    {
        const
            host = process.env.API_DATABASE_HOST,
            port = Number(process.env.API_DATABASE_PORT),
            user = process.env.API_DATABASE_USER,
            password = process.env.API_DATABASE_PASSWORD,
            database = process.env.API_DATABASE_NAME;

        // Vérification de la présence des identifiants de connection
        if (!host || Number.isNaN(port) || !user || !password || !database)
            throw new Error("Identifiants de connexion à la base de donnée manquants");

        this.connection = await createConnection({ host, port, user, password, database });

    }

    /**
     * Charger les managers de la base de donnée
     */
    public async loadManagers(): Promise<void>
    {
        this.users = new Manager<UsersPrimaryKeys, UsersKeys>(this, "users");
    }

    /**
     * Charger les tables de la base de donnée
     */
    public async loadTables(): Promise<void>
    {
        const tables = fs.readdirSync('./sql/schemas');

        for (let table of tables)
        {
            const file = fs.readFileSync(`./sql/schemas/${table}`, { encoding: 'utf-8' });

            await this.query(file);
        }
    }

    /**
     * Permet de faire de requête SQL à la base de donnée
     * @param {string} query
     */
    public async query<T extends QueryResult = RowDataPacket[]>(query: string): Promise<T>
    {
        this.server.log.trace(query);
        return (await this.connection!.query(query))[0] as T;
    }
}
