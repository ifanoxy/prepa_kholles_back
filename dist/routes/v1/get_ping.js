"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(app) {
    app.app.get("/v1/ping", async (req, res) => {
        res.status(200).json({ data: { ping: req.headers.date ? (Date.now() - new Date(req.headers.date).getTime()) : NaN } });
    });
    return "GET v1/ping";
}
