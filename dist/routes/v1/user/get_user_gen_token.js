"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(app) {
    app.app.post("/v1/user/gen_token", async (req, res) => {
        const errors = app.checkBodyParam(["password", "username"], req.body);
        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }
        const hashed_password = await app.hash_password(req.body.password);
        const user = await app.server.database.users.getIfExists({
            username: req.body.username,
            password: hashed_password
        }).catch(() => null);
        if (!user) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }
        const token = app.generateAPIToken(user.id.toString(), hashed_password);
        res.status(200).json({ token });
    });
    return "v1/user/auth";
}
