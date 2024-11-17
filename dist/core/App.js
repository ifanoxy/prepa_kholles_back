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
exports.App = void 0;
const express_1 = __importDefault(require("express"));
const fs = __importStar(require("fs"));
const path_1 = __importDefault(require("path"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const cors_1 = __importDefault(require("cors"));
class App {
    constructor(server) {
        this.server = server;
        this.app = (0, express_1.default)();
    }
    async init() {
        this.app.use((0, cors_1.default)({
            origin: "*",
        }));
        this.app.use(express_1.default.json({ limit: '16mb' }));
        this.app.use(express_1.default.urlencoded({ extended: true, limit: "16mb" }));
        this.loadRoutes();
        this.app.listen(process.env.API_PORT, () => this.server.log.info(`L'API est sur écoute sur le port ${process.env.API_PORT}`));
    }
    async isAuth(token) {
        try {
            return await this.getUserIdByToken(token);
        }
        catch {
            return false;
        }
    }
    /**
     * Permet de récupérer le chemin de tous les fichiers d'un dossier récursivement
     * @param {string} path
     */
    getFiles(path) {
        let files = [];
        for (let file of fs.readdirSync(path)) {
            if (file.includes("."))
                files.push(path + "/" + file);
            else
                files = files.concat(this.getFiles(path + "/" + file));
        }
        return files;
    }
    loadRoutes() {
        const files = this.getFiles("./dist/routes");
        for (let file of files) {
            const raw = require(path_1.default.join(process.cwd(), file));
            const route = raw.default(this);
            this.server.log.info(`Initialisation de la route ${route}`);
        }
    }
    /**
     * Génère un Token api à partir de l'identifiant de l'utilisateur et de son mot de passe
     * @param {string | number} user_id
     * @param {string} hashed_password
     */
    generateAPIToken(user_id, hashed_password) {
        if (!process.env.API_TOKEN_SECRET_KEY)
            this.server.log.fatal("Variables d'environnement manquante API_TOKEN_SECRET_KEY");
        return jsonwebtoken_1.default.sign({ user_id, hashed_password }, process.env.API_TOKEN_SECRET_KEY, {
            expiresIn: "365d"
        });
    }
    /**
     * Permet d'obtenir l'identifiant d'utilisateur avec son token. Retourne false en cas d'échec
     * @param {string} token
     */
    async getUserIdByToken(token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.API_TOKEN_SECRET_KEY);
            const user = await this.server.database.users.getIfExists({
                id: Number(decoded.user_id)
            }).catch(() => null);
            if (!user)
                return false;
            return decoded.hashed_password === user.password ? user.id : false;
        }
        catch (err) {
            return false;
        }
    }
    /**
     * Permet de vérifier un mot de passe hasher et un mot de passe. Retourne false en cas d'échec
     * @param password
     * @param hashed_password
     */
    async checkHashPassword(password, hashed_password) {
        try {
            return await bcrypt_1.default.compare(password, hashed_password);
        }
        catch (err) {
            return false;
        }
    }
    /**
     * Permet de hasher un mot de passe en utilisant la librairie bcrypt
     * @param {string} password
     */
    async hash_password(password) {
        const saltRounds = 10;
        return await bcrypt_1.default.hash(password, saltRounds);
    }
    /**
     * Vérifie si la liste de clé se trouve dans un objet passer en paramètre. Renvoie une liste d'erreurs
     * @param {string[]} keys
     * @param {Record<string, any>} body
     */
    checkBodyParam(keys, body) {
        const errors = [];
        for (const key of keys) {
            if (body[key] === undefined || body[key] === null) {
                errors.push({
                    field: key,
                    message: `${key} est requis.`
                });
            }
        }
        return errors;
    }
}
exports.App = App;
