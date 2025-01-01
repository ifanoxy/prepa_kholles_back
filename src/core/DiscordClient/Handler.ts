import fs from "fs";
import {DiscordClient} from "../Discord";
import {ApplicationCommandCreateOptions, EventListeners} from "eris";

export class Handler {
    public commands: Map<string, CommandFile>;
    public select: Map<string, SelectFile>;
    constructor(public client: DiscordClient) {
        this.commands = new Map();
        this.select = new Map();
    }

    /**
     * Retourne tous les fichiers d'un dossier récurssivement
     * @param path
     */
    getFiles(path: string): string[] {
        return fs.existsSync(path) ? fs
                .readdirSync(path)
                .map((x) => x.includes('.') ? path + '/' + x : this.getFiles(path + '/' + x),)
                .flat() : [];
    }

    /**
     * Charge tous les events du client discord
     */
    loadEvents() {
        const files = this.getFiles('dist/core/DiscordClient/Events');
        for (const file of files) {
            const raw = require(process.cwd() + '/' + file).default as EventFile;
            this.client.server.log.debug(`[DiscordClient] Chargement de l'event ${raw.name}`);
            this.client.on(raw.name, raw.execute.bind(null, this.client));
        }
    }

    /**
     * Charge tous les menu sélections du client discord
     */
    loadSelect() {
        const files = this.getFiles('dist/core/DiscordClient/Selects');
        for (const file of files) {
            const raw = require(process.cwd() + '/' + file).default as SelectFile;
            this.client.server.log.debug(`[DiscordClient] Chargement du menu sélectif ${raw.custom_id}`);
            this.select.set(raw.custom_id, raw);
        }
    }

    /**
     * Charge toute les commandes du client discord
     */
    loadCommands() {
        const files = this.getFiles('dist/core/DiscordClient/Commands');
        for (const file of files) {
            const raw = require(process.cwd() + '/' + file).default as CommandFile;
            this.client.server.log.debug(`[DiscordClient] Chargement de la commande ${raw.data.name}`);
            this.commands.set(raw.data.name, raw);
        }
    }
}

interface EventFile {
    name: keyof EventListeners;
    execute: (client: DiscordClient, ...args: any[]) => unknown;
}
interface SelectFile {
    custom_id: string;
    execute: (client: DiscordClient, ...args: any[]) => unknown;
}

interface CommandFile {
    data: ApplicationCommandCreateOptions<false>;
    execute: (client: DiscordClient, ...args: any[]) => unknown;
}