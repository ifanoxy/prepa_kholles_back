import Server from "../Server";
import {createConnection, QueryResult, RowDataPacket} from "mysql2/promise";
import {Connection} from "mysql2/promise";
import Manager from "./Manager";
import {UsersKeys, UsersPrimaryKeys} from "../../types/schemas/Users";
import * as fs from "fs";
import {ChapitresKeys, ChapitresPrimaryKey} from "../../types/schemas/Chapitres";
import {MatieresKeys, MatieresPrimaryKeys} from "../../types/schemas/Matieres";
import {SujetsKeys, SujetsPrimaryKeys} from "../../types/schemas/Sujets";
import {PermissionsKeys, PermissionsPrimaryKeys} from "../../types/schemas/Permissions";
import {CommentsKeys, CommentsPrimaryKeys} from "../../types/schemas/Comments";
import {KhollesPlanningKeys, KhollesPlanningPrimaryKeys} from "../../types/schemas/kholles_planning";

export default class Database
{
    private connection: Connection | undefined;
    public users!: Manager<UsersPrimaryKeys, UsersKeys>;
    public chapitres!: Manager<ChapitresPrimaryKey, ChapitresKeys>;
    public matieres!: Manager<MatieresPrimaryKeys, MatieresKeys>;
    public sujets!: Manager<SujetsPrimaryKeys, SujetsKeys>;
    public permissions!: Manager<PermissionsPrimaryKeys, PermissionsKeys>;
    public comments!: Manager<CommentsPrimaryKeys, CommentsKeys>;
    public planning!: Manager<KhollesPlanningPrimaryKeys, KhollesPlanningKeys>;

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
        this.chapitres = new Manager<ChapitresPrimaryKey, ChapitresKeys>(this, "chapitres");
        this.matieres = new Manager<MatieresPrimaryKeys, MatieresKeys>(this, "matieres");
        this.sujets = new Manager<SujetsPrimaryKeys, SujetsKeys>(this, "sujets");
        this.permissions = new Manager<PermissionsPrimaryKeys, PermissionsKeys>(this, "permissions");
        this.comments = new Manager<CommentsPrimaryKeys, CommentsKeys>(this, "commentaires");
        this.planning = new Manager<KhollesPlanningPrimaryKeys, KhollesPlanningKeys>(this, "kholle_schedule");
// Génération des mots de passe et insertion des données sous forme d'objets JavaScript
        const users = [
            { first_name: 'Oscar', last_name: 'RICHELME', identifiant: 'oscar', password: 'oscar123', group: 1, permission_id: 1 },
            { first_name: 'Noelan', last_name: 'SACCO', identifiant: 'noelan', password: 'noelan456', group: 1, permission_id: 1 },
            { first_name: 'Davit', last_name: 'SARIBEKYAN', identifiant: 'davit', password: 'davit789', group: 1, permission_id: 1 },
            { first_name: 'Anton', last_name: 'MONNAERT', identifiant: 'anton', password: 'anton234', group: 2, permission_id: 1 },
            { first_name: 'Vincent', last_name: 'PAWELCZYK', identifiant: 'vincent', password: 'vincent567', group: 2, permission_id: 1 },
            { first_name: 'Nathan', last_name: 'PONSARDIN', identifiant: 'nathan', password: 'nathan890', group: 2, permission_id: 1 },
            { first_name: 'Josias', last_name: 'GBAMELE', identifiant: 'josias', password: 'josias345', group: 3, permission_id: 1 },
            { first_name: 'Ethan', last_name: 'HALIMI-BATILLAT', identifiant: 'ethan', password: 'ethan678', group: 3, permission_id: 1 },
            { first_name: 'Johnny', last_name: 'ZHANG', identifiant: 'johnny', password: 'johnny901', group: 3, permission_id: 1 },
            { first_name: 'Hamza', last_name: 'AY', identifiant: 'hamza', password: 'hamza456', group: 4, permission_id: 1 },
            { first_name: 'Paul', last_name: 'BERNHARD', identifiant: 'paul', password: 'paul123', group: 4, permission_id: 1 },
            { first_name: 'Thomas', last_name: 'LEBON', identifiant: 'thomas1', password: 'thomas1123', group: 4, permission_id: 1 },
            { first_name: 'Lucas', last_name: 'BADRE', identifiant: 'lucas', password: 'lucas789', group: 5, permission_id: 1 },
            { first_name: 'Nathanael', last_name: 'CARABIN', identifiant: 'nathanael', password: 'nathanael345', group: 5, permission_id: 1 },
            { first_name: 'Ruben', last_name: 'DE ALMEIDA', identifiant: 'ruben', password: 'ruben678', group: 5, permission_id: 1 },
            { first_name: 'Louis', last_name: 'MARABELLE', identifiant: 'louis1', password: 'louis1123', group: 6, permission_id: 1 },
            { first_name: 'Marcelo', last_name: 'VASQUEZ CRUZ', identifiant: 'marcelo', password: 'marcelo901', group: 6, permission_id: 1 },
            { first_name: 'Lino', last_name: 'ZIGNIN', identifiant: 'lino', password: 'lino234', group: 6, permission_id: 1 },
            { first_name: 'Abdelmajid', last_name: 'ABOULOULA', identifiant: 'abdelmajid', password: 'abdelmajid567', group: 7, permission_id: 1 },
            { first_name: 'Jerome', last_name: 'JANJI', identifiant: 'jerome', password: 'jerome890', group: 7, permission_id: 1 },
            { first_name: 'Maxime', last_name: 'LIM', identifiant: 'maxime', password: 'maxime345', group: 7, permission_id: 1 },
            { first_name: 'Anais', last_name: 'CHIBANE', identifiant: 'anais', password: 'anais678', group: 8, permission_id: 1 },
            { first_name: 'Amine', last_name: 'GEANAH', identifiant: 'amine', password: 'amine901', group: 8, permission_id: 1 },
            { first_name: 'Clovis', last_name: 'WEBER', identifiant: 'clovis', password: 'clovis456', group: 8, permission_id: 1 },
            { first_name: 'Georgia', last_name: 'SALVINI', identifiant: 'georgia', password: 'georgia789', group: 9, permission_id: 1 },
            { first_name: 'Alexandre', last_name: 'WATRIN', identifiant: 'alexandre', password: 'alexandre123', group: 9, permission_id: 1 },
            { first_name: 'Nolann', last_name: 'TOVOR', identifiant: 'nolann', password: 'nolann234', group: 10, permission_id: 1 },
            { first_name: 'Owen', last_name: 'CARON', identifiant: 'owen', password: 'owen567', group: 10, permission_id: 1 },
            { first_name: 'Lamine', last_name: 'THIAM', identifiant: 'lamine', password: 'lamine890', group: 10, permission_id: 1 },
            { first_name: 'Thomas', last_name: 'LHOMOND', identifiant: 'thomas2', password: 'thomas2123', group: 11, permission_id: 1 },
            { first_name: 'Djeneba Sephora', last_name: 'DIABATE', identifiant: 'djeneba_sephora', password: 'djeneba_sephora456', group: 11, permission_id: 1 },
            { first_name: 'Tiana', last_name: 'HEUGAS MOLINIER', identifiant: 'tiana', password: 'tiana789', group: 11, permission_id: 1 },
            { first_name: 'Alwin', last_name: 'LE BIHAN', identifiant: 'alwin', password: 'alwin901', group: 12, permission_id: 1 },
            { first_name: 'Mathis', last_name: 'BARYLA', identifiant: 'mathis', password: 'mathis234', group: 12, permission_id: 1 },
            { first_name: 'Elisa', last_name: 'ROYER', identifiant: 'elisa', password: 'elisa567', group: 12, permission_id: 1 },
            { first_name: 'Nohe', last_name: 'BERTIN', identifiant: 'nohe', password: 'nohe890', group: 13, permission_id: 1 },
            { first_name: 'Roland', last_name: 'FRETEL', identifiant: 'roland', password: 'roland345', group: 13, permission_id: 1 },
            { first_name: 'Louis', last_name: 'DIAS--CHAMPION', identifiant: 'louis2', password: 'louis2123', group: 13, permission_id: 1 },
            { first_name: 'Paul', last_name: 'GAUTHIER', identifiant: 'paul', password: 'paul678', group: 14, permission_id: 1 },
            { first_name: 'Ahmed', last_name: 'AIT ABID', identifiant: 'ahmed', password: 'ahmed901', group: 14, permission_id: 1 },
            { first_name: 'Blaise', last_name: 'HAKIZIMANA', identifiant: 'blaise', password: 'blaise456', group: 14, permission_id: 1 },
            { first_name: 'Titouan', last_name: 'SILLARD', identifiant: 'titouan', password: 'titouan789', group: 15, permission_id: 1 },
            { first_name: 'Gabriel', last_name: 'MERCIER', identifiant: 'gabriel', password: 'gabriel234', group: 15, permission_id: 1 },
            { first_name: 'Louis', last_name: 'SANZ DE FRUTOS', identifiant: 'louis', password: 'louis567', group: 15, permission_id: 1 }
        ];


        await this.users.insert(await Promise.all(users.map(async x => ({
            id: null,
            first_name: x.first_name,
            last_name: x.last_name,
            identifiant: x.identifiant,
            password: await this.server.app.hash_password(x.identifiant),
            permission: 1,
            group: x.group
        })))
        )
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
        if (query.length <= 200)
            this.server.log.trace(query);
        return (await this.connection!.query(query))[0] as T;
    }
}
