import * as fs from "fs";

export default class Logger
{
    public readonly level: LoggerLevel;

    constructor(level: LoggerLevel = LoggerLevel.Trace) {
        this.level = level;
    }

    /**
     * Renvoie l'heure sous le format "[HH:MM:SS DD/MM/YYYY]"
     * @public
     * @static
     */
    public static get format_time(): string
    {
        const date = new Date();
        return `\x1b[90m\x1b[1m[\x1b[0m\x1b[33m${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")} ${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear().toString().padStart(2, "0")}\x1b[0m\x1b[90m\x1b[1m]\x1b[0m`
    }

    /**
     * Afficher un message au niveau Trace de log
     * @param {any} data les données a afficher
     */
    public trace(data: any)
    {
        for (let element of this.anyToString(data))
        {
            this.write_log(LoggerLevel.Trace, element);
        }
    }

    /**
     * Afficher un message au niveau Info de log
     * @param {any} data les données a afficher
     */
    public info(data: any)
    {
        for (let element of this.anyToString(data))
        {
            this.write_log(LoggerLevel.Info, element);
        }
    }

    /**
     * Afficher un message au niveau Warn de log
     * @param {any} data les données a afficher
     */
    public warn(data: any)
    {
        for (let element of this.anyToString(data))
        {
            this.write_log(LoggerLevel.Warn, element);
        }
    }

    /**
     * Afficher un message au niveau Info de log
     * @param {any} data les données a afficher
     */
    public error(data: any)
    {
        for (let element of this.anyToString(data))
        {
            this.write_log(LoggerLevel.Error, element);
        }
    }

    /**
     * Afficher un message au niveau Info de log
     * @param {string} message le message d'erreur
     * @param {any} data les données a afficher
     */
    public fatal(message: string, data?: any)
    {
        for (let element of this.anyToString(data))
        {
            this.write_log(LoggerLevel.Fatal, element);
        }

        throw new Error(message);
    }

    /**
     * Permet de convertir tout type en liste de string
     * @param {any} data
     * @private
     */
    private anyToString(data: any): string[]
    {
        switch (typeof data) {
            case 'number' : return [data.toString().yellow]
            case 'bigint' : return [data.toString().yellow]
            case 'string' : return [data.white]
            case "boolean": return [data ? 'true'.cyan : 'false'.cyan]
            case "object" : {
                const lines = JSON.stringify(data, (_k, v) => v === undefined ? 'UNDEFINED' : v, 2)
                    .replace(/"([^"]*)"/g, '\x1b[32m"$1"\x1b[0m')
                    .replace(/\b(\d+)\b/g, '\x1b[33m$1\x1b[0m')
                    .replace(/"UNDEFINED"/g, 'undefined'.grey.bright)
                    .replace(/true/g, 'true'.cyan)
                    .replace(/false/g, 'false'.cyan)
                    .replace(/null/g, 'null'.magenta)
                    .split('\n');

                let newLines: string[] = [];
                lines.forEach((v, i) => {
                    if (['{', ' [', ',', ' ]'].some(c => newLines.at(-1)?.includes(c) && (v.includes(c) || (!v.includes(',') && !v.includes('[') && lines.at(i - 1)?.includes(','))) && ((newLines.at(-1)?.match(/,/g) || []).length <= 4) && (newLines.at(-1)?.includes('\x1b[33m')) ))
                    {
                        newLines[newLines.length - 1] = newLines[newLines.length - 1] + ' ' + v.trim()
                    } else {
                        newLines.push(v)
                    }
                })
                return newLines
            }

            case "undefined": return ['undefined'.grey.bright]
            default: return [data]
        }
    }

    /**
     * Permet d'afficher la log dans la console et de la stocker en fichier
     * @param {LoggerLevel} tag
     * @param {string} message
     * @private
     */
    private write_log(tag: LoggerLevel, message: string): void
    {
        if (tag >= this.level)
            console.log(Logger.format_time, LoggerTag[LoggerLevel[tag as unknown as keyof typeof LoggerLevel] as unknown as keyof typeof LoggerTag], "", message);

        const date = new Date();

        const
            dirname = date.toLocaleDateString("fr", { dateStyle: "long" }).slice(3),
            filename = date.toLocaleDateString("fr", { dateStyle: "medium" });

        if (!fs.existsSync(`./logs/${dirname}`))
            fs.mkdirSync(`./logs/${dirname}`);

        if (!fs.existsSync(`./logs/${dirname}/${filename}`))
            fs.writeFileSync(`./logs/${dirname}/${filename}`, "date;time;level;message\n", { encoding: "utf-8"});

        fs.appendFileSync(
            `./logs/${dirname}/${filename}`,
            [
                `${date.getDay().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear().toString().padStart(2, "0")}`,
                `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}.${date.getMilliseconds().toString().padStart(2, "0")}`,
                LoggerLevel[tag],
                message
            ].join(";") + "\n"
        );
    }
}

export enum LoggerLevel {
    Trace = 0,
    Debug = 1,
    Info = 2,
    Warn = 3,
    Error = 4,
    Fatal = 5,
}

export enum LoggerTag {
    Trace = "\x1b[33m\x1b[1m  TRACE \x1b[0m",
    Debug = "\x1b[32m\x1b[1m  DEBUG \x1b[0m",
    Info = "\x1b[34m\x1b[1m  INFO  \x1b[0m",
    Warn = " \x1b[43m\x1b[30m\x1b[1m WARN \x1b[0m ",
    Error = " \x1b[41m\x1b[30m\x1b[1m ERROR \x1b[0m",
    Fatal = " \x1b[41m\x1b[30m\x1b[1m FATAL \x1b[0m",
}
