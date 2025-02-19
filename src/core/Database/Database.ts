import Server from "../Server";
import { createPool, Pool, QueryResult, RowDataPacket } from "mysql2/promise";
import Manager from "./Manager";
import { UsersKeys, UsersPrimaryKeys } from "../../types/schemas/Users";
import * as fs from "fs";
import LRUCache from "lru-cache";
import { ChapitresKeys, ChapitresPrimaryKey } from "../../types/schemas/Chapitres";
import { MatieresKeys, MatieresPrimaryKeys } from "../../types/schemas/Matieres";
import { SujetsKeys, SujetsPrimaryKeys } from "../../types/schemas/Sujets";
import { PermissionsKeys, PermissionsPrimaryKeys } from "../../types/schemas/Permissions";
import { CommentsKeys, CommentsPrimaryKeys } from "../../types/schemas/Comments";
import { KhollesPlanningKeys, KhollesPlanningPrimaryKeys } from "../../types/schemas/kholles_planning";
import { DemonstrationKeys, DemonstrationPrimaryKeys } from "../../types/schemas/Demonstration";
import { ProgrammesKeys, ProgrammesPrimaryKeys } from "../../types/schemas/Programmes";

export default class Database {
    private pool: Pool;
    public users!: Manager<UsersPrimaryKeys, UsersKeys>;
    public chapitres!: Manager<ChapitresPrimaryKey, ChapitresKeys>;
    public matieres!: Manager<MatieresPrimaryKeys, MatieresKeys>;
    public sujets!: Manager<SujetsPrimaryKeys, SujetsKeys>;
    public permissions!: Manager<PermissionsPrimaryKeys, PermissionsKeys>;
    public comments!: Manager<CommentsPrimaryKeys, CommentsKeys>;
    public planning!: Manager<KhollesPlanningPrimaryKeys, KhollesPlanningKeys>;
    public demonstration!: Manager<DemonstrationPrimaryKeys, DemonstrationKeys>;
    public programmes!: Manager<ProgrammesPrimaryKeys, ProgrammesKeys>;
    public cache: LRUCache<number, SujetsPrimaryKeys & SujetsKeys>;

    constructor(private readonly server: Server) {
        this.cache = new LRUCache({
            max: 1000,
            ttl: 3 * 24 * 60 * 60000,
            updateAgeOnGet: true
        });

        this.pool = createPool({
            host: process.env.API_DATABASE_HOST,
            port: Number(process.env.API_DATABASE_PORT),
            user: process.env.API_DATABASE_USER,
            password: process.env.API_DATABASE_PASSWORD,
            database: process.env.API_DATABASE_NAME,
            waitForConnections: true,
            connectionLimit: 25,
            queueLimit: 0
        });
    }

    /**
     * Charger les managers de la base de donnée
     */
    public async loadManagers(): Promise<void> {
        this.users = new Manager<UsersPrimaryKeys, UsersKeys>(this, "users");
        this.chapitres = new Manager<ChapitresPrimaryKey, ChapitresKeys>(this, "chapitres");
        this.matieres = new Manager<MatieresPrimaryKeys, MatieresKeys>(this, "matieres");
        this.sujets = new Manager<SujetsPrimaryKeys, SujetsKeys>(this, "sujets");
        this.permissions = new Manager<PermissionsPrimaryKeys, PermissionsKeys>(this, "permissions");
        this.comments = new Manager<CommentsPrimaryKeys, CommentsKeys>(this, "commentaires");
        this.planning = new Manager<KhollesPlanningPrimaryKeys, KhollesPlanningKeys>(this, "kholle_schedule");
        this.demonstration = new Manager<DemonstrationPrimaryKeys, DemonstrationKeys>(this, "demonstration");
        this.programmes = new Manager<ProgrammesPrimaryKeys, ProgrammesKeys>(this, "programmes");
    }

    /**
     * Charger les tables de la base de donnée
     */
    public async loadTables(): Promise<void> {
        const tables = fs.readdirSync('./sql/schemas');

        for (let table of tables) {
            const file = fs.readFileSync(`./sql/schemas/${table}`, { encoding: 'utf-8' });
            await this.query(file);
        }
    }

    /**
     * Permet de faire de requête SQL à la base de donnée
     * @param {string} query
     */
    public async query<T extends QueryResult = RowDataPacket[]>(query: string): Promise<T> {
        if (query.length <= 200) {
            this.server.log.trace(query);
        }

        const [results] = await this.pool.query(query);
        return results as T;
    }

    public async checkCon() {
        try {
            await this.pool.getConnection();
        } catch {
            this.pool = createPool({
                host: process.env.API_DATABASE_HOST,
                port: Number(process.env.API_DATABASE_PORT),
                user: process.env.API_DATABASE_USER,
                password: process.env.API_DATABASE_PASSWORD,
                database: process.env.API_DATABASE_NAME,
                waitForConnections: true,
                connectionLimit: 25,
                queueLimit: 0
            });
        }
    }
}
