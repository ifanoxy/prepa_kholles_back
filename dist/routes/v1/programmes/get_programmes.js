"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(app) {
    app.app.get("/v1/programmes", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        if (!token || !await app.isAuth(token)) {
            res.status(401).send("Unauthorized");
            return;
        }
        const demosData = await app.server.database.programmes.getAll();
        res.status(200).json({ data: demosData.map(x => ({ ...x, pdf: x?.pdf?.toString() ?? null })) });
    });
    return "GET v1/programmes";
}
