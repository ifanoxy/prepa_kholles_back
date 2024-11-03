"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(app) {
    app.app.post("/v1/user/auth", async (req, res) => {
        const errors = app.checkBodyParam(['token', 'user_id'], req.body);
        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }
        const valid_token = await app.getUserIdByToken(req.body.token);
        res.status(200).json({ valid: valid_token === Number(req.body.user_id) });
    });
    return "POST v1/user/auth";
}
