"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(app) {
    app.app.get("/v1/comments/:sujet_id", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        if (!token || !await app.isAuth(token)) {
            res.status(401).send("Unauthorized");
            return;
        }
        const comments = await app.server.database.comments.getAll({ sujet_id: Number(req.params.sujet_id) }, ['content', 'author_id', 'id', 'created_time'], { limits: 50, orderBy: "id DESC" });
        const user_ids = [...new Set(comments.map(x => x.author_id))];
        const users = await Promise.all(user_ids.map(async (x) => app.server.database.users.getIfExists({ id: x }, ["identifiant", "last_name", "first_name", "id"])));
        res.status(200).json({ data: comments.map(x => ({ ...x, author: users.find(y => y.id === x.author_id) })) });
    });
    return "GET v1/comments/:sujet_id";
}
