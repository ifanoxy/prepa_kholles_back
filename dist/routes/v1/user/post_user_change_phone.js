"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(app) {
    app.app.post("/v1/user/change_phone", async (req, res) => {
        const errors = app.checkBodyParam(["phone_number"], req.body);
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
        await app.server.database.users.update({
            id: user_id,
        }, {
            phone_number: req.body.phone_number,
        });
        res.status(200).json({ data: true });
    });
    return "POST v1/user/change_password";
}
