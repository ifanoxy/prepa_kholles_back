"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = {
    name: "ready",
    async execute(client) {
        await client.loadCommands();
    },
};
