"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(app) {
    app.app.post("/v1/user/perm", async (req, res) => {
        const errors = [];
        if (!req.body.permission || !req.body.user_id)
            errors.push({
                field: "permission & user_id",
                message: `permission et user_id sont requis.`
            });
        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }
        const token = req.headers?.authorization?.split(' ')[1];
        const user_id = token ? await app.isAuth(token) : null;
        if (!user_id || !await app.isAdmin(user_id)) {
            res.status(401).send("Unauthorized");
            return;
        }
        const perm = await app.server.database.permissions.getIfExists({ name: req.body.permission });
        if (!perm) {
            res.status(401).send("Unresolved permission");
            return;
        }
        await app.server.database.users.update({ id: req.body.user_id }, { permission: perm.id });
        res.status(200).json("changed !");
    });
    return "POST v1/user/perm";
}
