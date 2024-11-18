"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(app) {
    app.app.post("/v1/user/change_password", async (req, res) => {
        const errors = app.checkBodyParam(["old_password", "new_password", "confirm_password"], req.body);
        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }
        const token = req.headers?.authorization?.split(' ')[1];
        const user_id = token ? await app.isAuth(token) : null;
        if (!token || !user_id) {
            res.status(401).send("Unauthorized");
            return;
        }
        if (req.body.new_password != req.body.confirm_password) {
            res.status(401).send({ message: "Les mots de passe doivent être identiques" });
            return;
        }
        const user = await app.server.database.users.getIfExists({
            id: user_id,
        }, ['password']).catch(() => null);
        if (!user || !await app.checkHashPassword(req.body.old_password, user.password)) {
            res.status(401).json({ message: "Ancien mot de passe incorrect" });
            return;
        }
        const new_hashed_password = await app.hash_password(req.body.confirm_password);
        await app.server.database.users.update({
            id: user_id,
        }, {
            password: new_hashed_password,
        });
        const new_token = app.generateAPIToken(user_id, new_hashed_password);
        res.status(200).json({ new_token });
    });
    return "POST v1/user/change_password";
}
