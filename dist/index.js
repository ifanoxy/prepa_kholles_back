"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
require("./types/declare/main");
const Server_1 = __importDefault(require("./core/Server"));
new Server_1.default().init();
