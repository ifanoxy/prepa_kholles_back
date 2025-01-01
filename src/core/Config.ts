import fs from "fs";

export class Config {
    private data!: IConfig;
    constructor() {
        this.loadConfig();
    }

    private loadConfig() {
        this.data = require(process.cwd() + "/config.json");
        console.log(this.data)
    }

    public get<T extends keyof IConfig>(key: T): IConfig[T] {
        if (!this.data) this.loadConfig();
        return this.data[key];
    }

    public set<T extends keyof IConfig>(key: T, value: IConfig[T]): void {
        if (!this.data) this.loadConfig();
        this.data[key] = value ;
        fs.writeFileSync("../../config.json", JSON.stringify(this.data, null, 2));
    }
}
interface IConfig {
    sujet_channel_id: string,
    roles: {
        [x in 'Mathématiques' | 'Physique' | 'Chimie' | 'Informatique' | 'Science Ingénieur' | 'Anglais' | 'Français']: string
    }
}