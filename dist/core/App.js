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
class App {
    constructor(server) {
        this.server = server;
        this.app = (0, express_1.default)();
    }
    init() {
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
        this.loadRoutes();
        this.app.listen(process.env.API_PORT, () => this.server.log.info(`L'API est sur écoute sur le port ${process.env.API_PORT}`));
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
        console.log(files);
        for (let file of files) {
            const raw = require(path_1.default.join(process.cwd(), file));
            const route = raw.default(this);
            this.server.log.info(`Initialisation de la route ${route}`);
        }
    }
    /**
     * Génère un Token api à partir de l'identifiant de l'utilisateur et de son mot de passe
     * @param {string} user_id
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
     * Permet de vérifier si le token est valide
     * @param {string} user_id
     * @param {string} hashed_password
     * @param {string} token
     */
    verifyToken(user_id, hashed_password, token) {
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.API_TOKEN_SECRET_KEY);
            return decoded.hashed_password === hashed_password && decoded.user_id === user_id;
        }
        catch (err) {
            return false;
        }
    }
    async hash_password(password) {
        const saltRounds = 10;
        return await bcrypt_1.default.hash(password, saltRounds);
    }
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
