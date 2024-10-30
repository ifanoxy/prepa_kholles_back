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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoggerTag = exports.LoggerLevel = void 0;
const fs = __importStar(require("fs"));
class Logger {
    constructor(level = LoggerLevel.Trace) {
        this.level = level;
    }
    /**
     * Renvoie l'heure sous le format "[HH:MM:SS DD/MM/YYYY]"
     * @public
     * @static
     */
    static get format_time() {
        const date = new Date();
        return `\x1b[90m\x1b[1m[\x1b[0m\x1b[33m${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")} ${date.getDate().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear().toString().padStart(2, "0")}\x1b[0m\x1b[90m\x1b[1m]\x1b[0m`;
    }
    /**
     * Afficher un message au niveau Trace de log
     * @param {any} data les données a afficher
     */
    trace(data) {
        for (let element of this.anyToString(data)) {
            this.write_log(LoggerLevel.Trace, element);
        }
    }
    /**
     * Afficher un message au niveau Info de log
     * @param {any} data les données a afficher
     */
    info(data) {
        for (let element of this.anyToString(data)) {
            this.write_log(LoggerLevel.Info, element);
        }
    }
    /**
     * Afficher un message au niveau Warn de log
     * @param {any} data les données a afficher
     */
    warn(data) {
        for (let element of this.anyToString(data)) {
            this.write_log(LoggerLevel.Warn, element);
        }
    }
    /**
     * Afficher un message au niveau Info de log
     * @param {any} data les données a afficher
     */
    error(data) {
        for (let element of this.anyToString(data)) {
            this.write_log(LoggerLevel.Error, element);
        }
    }
    /**
     * Afficher un message au niveau Info de log
     * @param {string} message le message d'erreur
     * @param {any} data les données a afficher
     */
    fatal(message, data) {
        for (let element of this.anyToString(data)) {
            this.write_log(LoggerLevel.Fatal, element);
        }
        throw new Error(message);
    }
    /**
     * Permet de convertir tout type en liste de string
     * @param {any} data
     * @private
     */
    anyToString(data) {
        switch (typeof data) {
            case 'number': return [data.toString().yellow];
            case 'bigint': return [data.toString().yellow];
            case 'string': return [data.white];
            case "boolean": return [data ? 'true'.cyan : 'false'.cyan];
            case "object": {
                const lines = JSON.stringify(data, (_k, v) => v === undefined ? 'UNDEFINED' : v, 2)
                    .replace(/"([^"]*)"/g, '\x1b[32m"$1"\x1b[0m')
                    .replace(/\b(\d+)\b/g, '\x1b[33m$1\x1b[0m')
                    .replace(/"UNDEFINED"/g, 'undefined'.grey.bright)
                    .replace(/true/g, 'true'.cyan)
                    .replace(/false/g, 'false'.cyan)
                    .replace(/null/g, 'null'.magenta)
                    .split('\n');
                let newLines = [];
                lines.forEach((v, i) => {
                    if (['{', ' [', ',', ' ]'].some(c => newLines.at(-1)?.includes(c) && (v.includes(c) || (!v.includes(',') && !v.includes('[') && lines.at(i - 1)?.includes(','))) && ((newLines.at(-1)?.match(/,/g) || []).length <= 4) && (newLines.at(-1)?.includes('\x1b[33m')))) {
                        newLines[newLines.length - 1] = newLines[newLines.length - 1] + ' ' + v.trim();
                    }
                    else {
                        newLines.push(v);
                    }
                });
                return newLines;
            }
            case "undefined": return ['undefined'.grey.bright];
            default: return [data];
        }
    }
    /**
     * Permet d'afficher la log dans la console et de la stocker en fichier
     * @param {LoggerLevel} tag
     * @param {string} message
     * @private
     */
    write_log(tag, message) {
        if (tag >= this.level)
            console.log(Logger.format_time, LoggerTag[LoggerLevel[tag]], "", message);
        const date = new Date();
        const dirname = date.toLocaleDateString("fr", { dateStyle: "long" }).slice(3), filename = date.toLocaleDateString("fr", { dateStyle: "medium" });
        if (!fs.existsSync(`./logs/${dirname}`))
            fs.mkdirSync(`./logs/${dirname}`);
        if (!fs.existsSync(`./logs/${dirname}/${filename}`))
            fs.writeFileSync(`./logs/${dirname}/${filename}`, "date;time;level;message\n", { encoding: "utf-8" });
        fs.appendFileSync(`./logs/${dirname}/${filename}`, [
            `${date.getDay().toString().padStart(2, "0")}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear().toString().padStart(2, "0")}`,
            `${date.getHours().toString().padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}.${date.getMilliseconds().toString().padStart(2, "0")}`,
            LoggerLevel[tag],
            message
        ].join(";") + "\n");
    }
}
exports.default = Logger;
var LoggerLevel;
(function (LoggerLevel) {
    LoggerLevel[LoggerLevel["Trace"] = 0] = "Trace";
    LoggerLevel[LoggerLevel["Debug"] = 1] = "Debug";
    LoggerLevel[LoggerLevel["Info"] = 2] = "Info";
    LoggerLevel[LoggerLevel["Warn"] = 3] = "Warn";
    LoggerLevel[LoggerLevel["Error"] = 4] = "Error";
    LoggerLevel[LoggerLevel["Fatal"] = 5] = "Fatal";
})(LoggerLevel || (exports.LoggerLevel = LoggerLevel = {}));
var LoggerTag;
(function (LoggerTag) {
    LoggerTag["Trace"] = "\u001B[33m\u001B[1m  TRACE \u001B[0m";
    LoggerTag["Debug"] = "\u001B[32m\u001B[1m  DEBUG \u001B[0m";
    LoggerTag["Info"] = "\u001B[34m\u001B[1m  INFO  \u001B[0m";
    LoggerTag["Warn"] = " \u001B[43m\u001B[30m\u001B[1m WARN \u001B[0m ";
    LoggerTag["Error"] = " \u001B[41m\u001B[30m\u001B[1m ERROR \u001B[0m";
    LoggerTag["Fatal"] = " \u001B[41m\u001B[30m\u001B[1m FATAL \u001B[0m";
})(LoggerTag || (exports.LoggerTag = LoggerTag = {}));
