"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const promise_1 = require("mysql2/promise");
const Manager_1 = __importDefault(require("./Manager"));
const fs = __importStar(require("fs"));
class Database {
    constructor(server) {
        this.server = server;
    }
    /**
     * Permet de créer une connection avec la base de donnée
     */
    async authenticate() {
        const host = process.env.API_DATABASE_HOST, port = Number(process.env.API_DATABASE_PORT), user = process.env.API_DATABASE_USER, password = process.env.API_DATABASE_PASSWORD, database = process.env.API_DATABASE_NAME;
        // Vérification de la présence des identifiants de connection
        if (!host || Number.isNaN(port) || !user || !password || !database)
            throw new Error("Identifiants de connexion à la base de donnée manquants");
        this.connection = await (0, promise_1.createConnection)({ host, port, user, password, database });
    }
    /**
     * Charger les managers de la base de donnée
     */
    async loadManagers() {
        this.users = new Manager_1.default(this, "users");
        this.chapitres = new Manager_1.default(this, "chapitres");
        this.matieres = new Manager_1.default(this, "matieres");
        this.sujets = new Manager_1.default(this, "sujets");
        this.permissions = new Manager_1.default(this, "permissions");
        this.comments = new Manager_1.default(this, "commentaires");
        this.planning = new Manager_1.default(this, "kholle_schedule");
        this.demonstration = new Manager_1.default(this, "demonstration");
    }
    /**
     * Charger les tables de la base de donnée
     */
    async loadTables() {
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
    async query(query) {
        if (query.length <= 200)
            this.server.log.trace(query);
        return (await this.connection.query(query))[0];
    }
}
exports.default = Database;
