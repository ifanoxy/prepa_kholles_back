"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(app) {
    app.app.get("/v1/users/mod", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        const user_id = token ? await app.isAuth(token) : null;
        if (!user_id || !await app.isMod(user_id)) {
            res.status(401).send("Unauthorized");
            return;
        }
        const users = await app.server.database.users.getAll(undefined, ["first_name", "last_name", "group", 'id', 'identifiant', 'permission']);
        res.status(200).json({ data: await Promise.all(users.map(async (x) => ({
                ...x,
                permission: await app.server.database.permissions.get({ id: x.permission }),
                stats: {
                    sujet_sended: await app.server.database.sujets.size({ author_id: x.id }),
                    comment_sended: await app.server.database.comments.size({ author_id: x.id }),
                }
            })))
        });
    });
    return "GET v1/users";
}
