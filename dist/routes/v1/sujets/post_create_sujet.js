"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(app) {
    app.app.post("/v1/sujets/create", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        if (!token || !await app.isAuth(token)) {
            res.status(401).send("Unauthorized");
            return;
        }
        const errors = app.checkBodyParam(["matiere_id", "image"], req.body);
        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }
        const user_id = await app.getUserIdByToken(req.headers?.authorization.split(' ')[1]);
        if (!user_id)
            return;
        await app.server.database.sujets.insert({
            id: null,
            matiere_id: req.body.matiere_id,
            author_id: user_id,
            image: req.body.image,
            chapitre_id: req.body.chapitre_id ? req.body.chapitre_id : null
        });
        res.status(200).json({ message: `Successfully created` });
    });
    return "POST v1/sujets/create";
}
