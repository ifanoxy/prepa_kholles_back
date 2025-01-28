"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(app) {
    app.app.post("/v1/demonstration/create", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        const user_id = token ? await app.getUserIdByToken(token) : false;
        if (!user_id || !await app.isMod(user_id)) {
            res.status(401).send("Unauthorized");
            return;
        }
        const errors = app.checkBodyParam(["name", 'week'], req.body);
        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }
        await app.server.database.demonstration.insert({
            id: null,
            name: req.body.name,
            pdf: req?.body?.pdf ?? null,
            week: req.body.week,
            author_id: user_id
        });
        res.status(200).json({ message: `Successfully created` });
    });
    return "POST v1/demonstration/create";
}
