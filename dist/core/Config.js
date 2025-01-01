"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Config = void 0;
const fs_1 = __importDefault(require("fs"));
class Config {
    constructor() {
        this.loadConfig();
    }
    loadConfig() {
        this.data = require(process.cwd() + "/config.json");
        console.log(this.data);
    }
    get(key) {
        if (!this.data)
            this.loadConfig();
        return this.data[key];
    }
    set(key, value) {
        if (!this.data)
            this.loadConfig();
        this.data[key] = value;
        fs_1.default.writeFileSync("../../config.json", JSON.stringify(this.data, null, 2));
    }
}
exports.Config = Config;
