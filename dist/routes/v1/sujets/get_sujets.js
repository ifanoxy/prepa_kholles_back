"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const compression_1 = require("../../../utils/compression");
function default_1(app) {
    app.app.get("/v1/sujets", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        if (!token || !await app.isAuth(token)) {
            res.status(401).send("Unauthorized");
            return;
        }
        const sujets = await app.server.database.sujets.getAll(undefined, ['image', 'author_id', 'chapitre_id', 'matiere_id'], { limits: 25 });
        const sujetsData = await Promise.all(sujets.map(async (sujet) => {
            const author = await app.server.database.users.getIfExists({ id: sujet.author_id }, ['first_name', 'last_name']);
            const matiere = await app.server.database.matieres.getIfExists({ id: sujet.matiere_id });
            const chapitre = sujet.chapitre_id ? await app.server.database.chapitres.get({ id: sujet.chapitre_id }) : null;
            return {
                image: await (0, compression_1.compressImage)(sujet.image.toString(), {
                    quality: 75,
                    maxWidth: 800,
                    maxHeight: 800,
                }),
                author: author,
                chapitre: chapitre,
                matiere: matiere
            };
        }));
        res.status(200).json({ data: sujetsData });
    });
    return "GET v1/sujets";
}
