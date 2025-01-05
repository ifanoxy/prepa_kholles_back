"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(app) {
    app.app.get("/v1/user/stats", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        if (!token || !await app.isAuth(token)) {
            res.status(401).send("Unauthorized");
            return;
        }
        let user;
        if (req.query.identifiant)
            user = await app.server.database.users.getIfExists({
                identifiant: req.query.identifiant
            }, ["first_name", "last_name", "group", "permission", 'identifiant', 'id', 'class', 'phone_number']);
        else {
            user = await app.server.database.users.getIfExists({
                id: await app.getUserIdByToken(req.headers.authorization.split(" ")[1])
            }, ["first_name", "last_name", "group", "permission", 'identifiant', 'id', 'class', 'phone_number']);
        }
        if (!user) {
            res.status(400).send({ data: null });
            return;
        }
        const perm = await app.server.database.permissions.getIfExists({ id: user.permission }, ["name"]);
        const stats = {
            sujet_sended: await app.server.database.sujets.size({ author_id: user.id }),
            comment_sended: await app.server.database.comments.size({ author_id: user.id }),
        };
        res.status(200).json({ data: { user, permission: perm?.name ?? "Aucune", stats } });
    });
    return "GET v1/user/stats   ";
}
