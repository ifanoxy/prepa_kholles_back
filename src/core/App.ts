import express, { Express } from "express";
import Server from "./Server";
import * as fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import cors from "cors";
import {UserPermissions} from "../types/UserPermissions";
import {createConnection} from "mysql2/promise";

export class App {
    public app: Express;
    public server: Server;

    constructor(server: Server)
    {
        this.server = server;
        this.app = express();
    }

    public async init()
    {
        this.errorHandler();
        this.app.use(cors({
            origin: "*",
        }))
        this.app.use(express.json({ limit: '16Mb' }));
        this.app.use(express.urlencoded({ extended: true, limit: "16mb" }));

        this.loadRoutes();

        this.app.listen(process.env.API_PORT, () => this.server.log.info(`L'API est sur écoute sur le port ${process.env.API_PORT}`));
    }

    async isAuth(token: string): Promise<false | number>
    {
        try {
            return await this.getUserIdByToken(token);
        } catch {
            return false
        }
    }

    async isMod(user_id: number): Promise<boolean>
    {
        const user = await this.server.database.users.getIfExists({ id: user_id });
        if (!user)return false;
        return [
            UserPermissions.ADMINISTRATRICE,
            UserPermissions.ADMINISTRATEUR,
            UserPermissions.MODERATEUR,
            UserPermissions.MODERATRICE,
        ].includes(user.permission)
    }


    async isAdmin(user_id: number): Promise<boolean>
    {
        const user = await this.server.database.users.getIfExists({ id: user_id });
        if (!user)return false;
        return [
            UserPermissions.ADMINISTRATRICE,
            UserPermissions.ADMINISTRATEUR,
        ].includes(user.permission)
    }


    async isTeacher(user_id: number): Promise<boolean>
    {
        const user = await this.server.database.users.getIfExists({ id: user_id });
        if (!user)return false;
        return [
            UserPermissions.ADMINISTRATRICE,
            UserPermissions.ADMINISTRATEUR,
            UserPermissions.ENSEIGNANTE,
            UserPermissions.ENSEIGNANT,
        ].includes(user.permission)
    }

    /**
     * Permet de récupérer le chemin de tous les fichiers d'un dossier récursivement
     * @param {string} path
     */
    public getFiles(path: string): string[]
    {
        let files: string[] = [];

        for (let file of fs.readdirSync(path))
        {
            if (file.includes("."))
                files.push(path + "/" + file);
            else
                files = files.concat(this.getFiles(path + "/" + file));
        }

        return files;
    }

    public loadRoutes()
    {
        const files = this.getFiles("./dist/routes");

        for (let file of files)
        {
            const raw = require(path.join(process.cwd(), file));
            const route = raw.default(this);
            this.server.log.info(`Initialisation de la route ${route}`)
        }
    }

    /**
     * Génère un Token api à partir de l'identifiant de l'utilisateur et de son mot de passe
     * @param {string | number} user_id
     * @param {string} hashed_password
     */
    public generateAPIToken(user_id: string | number, hashed_password: string)
    {
        if (!process.env.API_TOKEN_SECRET_KEY)
            this.server.log.fatal("Variables d'environnement manquante API_TOKEN_SECRET_KEY");

        return jwt.sign(
            { user_id, hashed_password },
            process.env.API_TOKEN_SECRET_KEY as string,
            {
                expiresIn: "365d"
            }
        )
    }

    /**
     * Permet d'obtenir l'identifiant d'utilisateur avec son token. Retourne false en cas d'échec
     * @param {string} token
     */
    public async getUserIdByToken(token: string): Promise<number | false>
    {
        try {
            const decoded = jwt.verify(token, process.env.API_TOKEN_SECRET_KEY as string) as { user_id: string, hashed_password: string };

            const user = await this.server.database.users.getIfExists({
                id: Number(decoded.user_id)
            }).catch(() => null);

            if (!user)
                return false;

            return decoded.hashed_password === user.password ? user.id : false;
        } catch (err) {
            return false;
        }
    }

    /**
     * Permet de vérifier un mot de passe hasher et un mot de passe. Retourne false en cas d'échec
     * @param password
     * @param hashed_password
     */
    public async checkHashPassword(password: string, hashed_password: string): Promise<boolean>
    {
        try {
            return await bcrypt.compare(password, hashed_password);
        } catch (err) {
            return false;
        }
    }

    /**
     * Permet de hasher un mot de passe en utilisant la librairie bcrypt
     * @param {string} password
     */
    public async hash_password(password: string)
    {
        const saltRounds = 10;
        return await bcrypt.hash(password, saltRounds);
    }

    /**
     * Vérifie si la liste de clé se trouve dans un objet passer en paramètre. Renvoie une liste d'erreurs
     * @param {string[]} keys
     * @param {Record<string, any>} body
     */
    public checkBodyParam(keys: string[], body: Record<string, any>): { field: string, message: string }[]
    {
        const errors = [];

        for (const key of keys) {
            if (body[key] === undefined || body[key] === null) {
                errors.push({
                    field: key as string,
                    message: `${key} est requis.`
                });
            }
        }

        return errors;
    }

    private errorHandler() {
        const DISCORD_USER_ID = "429345463494508554";

        process.on('unhandledRejection', (reason) => {
            this.server.log.error(reason);
            this.server.discord?.getDMChannel(DISCORD_USER_ID)
                .then(channel => {
                    channel
                        .createMessage(`Une erreur \`unhandledRejection\` est survenue : \`\`\`${JSON.stringify(reason)}\`\`\``)
                        .catch(() => null);
                })
                .catch(() => null);
            try {
                this.server.database.resetConnection();
            } catch {}
        })

        process.on('uncaughtException', (reason) => {
            this.server.log.error(reason);
            this.server.discord?.getDMChannel(DISCORD_USER_ID)
                .then(channel => {
                    channel
                        .createMessage(`Une erreur \`uncaughtException\` est survenue : \`\`\`${JSON.stringify(reason)}\`\`\``)
                        .catch(() => null);
                })
                .catch(() => null);
            try {
                this.server.database.resetConnection();
            } catch {}
        })
        process.on('uncaughtExceptionMonitor', (reason) => {
            this.server.log.error(reason);
            this.server.discord?.getDMChannel(DISCORD_USER_ID)
                .then(channel => {
                    channel
                        .createMessage(`Une erreur \`uncaughtExceptionMonitor\` est survenue : \`\`\`${JSON.stringify(reason)}\`\`\``)
                        .catch(() => null);
                })
                .catch(() => null);
            try {
                this.server.database.resetConnection();
            } catch {}
        })
    }
}
