"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(app) {
    app.app.post("/v1/user/auth", async (req, res) => {
        const errors = [];
        if (!((req.body.token) || (req.body.identifiant && req.body.password)))
            errors.push({
                field: "identifiant & password | token",
                message: `identifiant et password ou token sont requis.`
            });
        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }
        let valid_token;
        if (req.body.token)
            valid_token = await app.getUserIdByToken(req.body.token);
        else {
            const user = await app.server.database.users.getIfExists({ identifiant: req.body.identifiant?.toLowerCase() });
            if (!user || !await app.checkHashPassword(req.body.password, user.password)) {
                res.status(400).json({
                    message: `Unauthorized`,
                });
                return;
            }
            valid_token = app.generateAPIToken(user.id, user.password);
        }
        res.status(200).json({ [req.body.token ? 'user_id' : 'token']: valid_token });
    });
    return "POST v1/user/auth";
}
