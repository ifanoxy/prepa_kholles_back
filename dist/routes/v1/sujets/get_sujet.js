"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const compression_1 = require("../../../utils/compression");
function default_1(app) {
    app.app.get("/v1/sujet/:sujet_id", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        if (!token || !await app.isAuth(token)) {
            res.status(401).send("Unauthorized");
            return;
        }
        const sujet = await app.server.database.sujets.get({ id: Number(req.params.sujet_id) }, ['image', 'comment_count', 'author_id', 'chapitre_id', 'matiere_id', 'id']);
        const author = await app.server.database.users.getIfExists({ id: sujet.author_id }, ['first_name', 'last_name', 'identifiant']);
        const matiere = await app.server.database.matieres.getIfExists({ id: sujet.matiere_id });
        const chapitre = sujet.chapitre_id ? await app.server.database.chapitres.get({ id: sujet.chapitre_id }) : null;
        try {
            res.status(200).json({
                image: await (0, compression_1.compressImage)(sujet.image.toString(), {
                    quality: 75,
                    maxWidth: 800,
                    maxHeight: 800,
                }).catch(() => null),
                id: sujet.id,
                author: author,
                chapitre: chapitre,
                matiere: matiere
            });
        }
        catch {
            res.status(200).json({});
            return;
        }
    });
    return "GET v1/sujets";
}
