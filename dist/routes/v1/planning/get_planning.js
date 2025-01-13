"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(app) {
    app.app.get("/v1/planning", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        if (!token || !await app.isAuth(token)) {
            res.status(401).send("Unauthorized");
            return;
        }
        const planning = await app.server.database.planning.getAll(undefined, '*', { limits: 1000 });
        res.status(200).json({ data: planning });
    });
    return "GET v1/sujets";
}
