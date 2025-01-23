"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(app) {
    app.app.post("/v1/admin/edit_password", async (req, res) => {
        const errors = app.checkBodyParam(["new_password", "user_id"], req.body);
        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }
        const token = req.headers?.authorization?.split(' ')[1];
        const user_id = token ? await app.isAuth(token) : null;
        if (!token || !user_id || !await app.isAdmin(user_id)) {
            res.status(401).send("Unauthorized");
            return;
        }
        const user = await app.server.database.users.getIfExists({
            id: user_id,
        }, ['password']).catch(() => null);
        if (!user) {
            res.status(401).json({ message: "Utilisateur inconnu" });
            return;
        }
        const new_hashed_password = await app.hash_password(req.body.new_password);
        await app.server.database.users.update({
            id: user_id,
        }, {
            password: new_hashed_password,
        });
        res.status(200).json({ valid: true });
    });
    return "POST v1/user/change_password";
}
