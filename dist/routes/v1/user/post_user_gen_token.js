"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(app) {
    app.app.post("/v1/user/gen_token", async (req, res) => {
        const errors = app.checkBodyParam(["password", "identifiant"], req.body);
        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }
        console.log(req.body);
        const hashed_password = await app.hash_password(req.body.password);
        console.log(hashed_password);
        const user = await app.server.database.users.getIfExists({
            identifiant: req.body.identifiant,
            password: hashed_password
        }).catch(() => null);
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const token = app.generateAPIToken(user.id.toString(), hashed_password);
        res.status(200).json({ token });
    });
    return "POST v1/user/gen_token";
}
