"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(app) {
    app.app.get("/v1/revision", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        const user_id = token ? await app.isAuth(token) : null;
        if (!user_id) {
            res.status(401).send("Unauthorized");
            return;
        }
        const revisionData = await app.server.database.revision.getAll(undefined, undefined, { orderBy: 'id DESC', limits: 100 });
        res.status(200).json({
            data: revisionData,
        });
    });
    return "GET v1/revision";
}
