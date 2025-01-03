"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(app) {
    app.app.get("/v1/users", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        if (!token || !await app.isAuth(token)) {
            res.status(401).send("Unauthorized");
            return;
        }
        const users = await app.server.database.users.getAll(undefined, ["first_name", "last_name", "group"]);
        res.status(200).json({ data: users });
    });
    return "GET v1/users";
}
