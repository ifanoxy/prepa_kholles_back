"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(app) {
    app.app.post("/v1/comment/:sujet_id", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        const user_id = token ? await app.isAuth(token) : false;
        if (!token || !user_id) {
            res.status(401).send("Unauthorized");
            return;
        }
        const errors = app.checkBodyParam(["content"], req.body);
        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }
        const sujet_id = Number(req.params.sujet_id);
        if (!await app.server.database.sujets.has({ id: sujet_id })) {
            res.status(400).json({ code: 400 });
            return;
        }
        await app.server.database.comments.insert({
            author_id: user_id,
            sujet_id,
            id: null,
            content: req.body.content,
        });
        await app.server.database.query("UPDATE `sujets` SET comment_count=comment_count+1 WHERE id=" + sujet_id);
        res.status(200).json({ data: true });
    });
    return "POST v1/comment/:sujet_id";
}
