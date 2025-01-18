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
        const params = {
            before_id: req.query?.before_id !== null ? Number(req.query.before_id) : null,
            matiere_id: req.query?.matiere_id ? Number(req.query.matiere_id) : null,
            limit: req.query?.limit ? (Number(req.query.limit) <= 50 ? Number(req.query.limit) : 20) : 20,
            offset: req.query?.offset ? Number(req.query?.offset) : 0,
        };
        const sujetIds = await app.server.database.sujets.getAll(params.matiere_id ? { matiere_id: params.matiere_id } : undefined, ['id'], { limits: params.limit, offset: params.offset, orderBy: "id DESC", beforeId: params.before_id });
        const cachedSujetIds = Array.from(app.server.database.cache.keys());
        const sujetIdsNotCached = sujetIds.map(x => x.id).filter(x => !cachedSujetIds.includes(x));
        const sujets = sujetIdsNotCached.length === 0 ? [] : await app.server.database.query(`SELECT \`image\`, \`author_id\`, \`comment_count\`, \`chapitre_id\`, \`matiere_id\`, \`id\` FROM \`sujets\` ${' WHERE ' + sujetIdsNotCached.map(x => `id=${x}`).join(' OR ')} LIMIT ${params.limit} OFFSET ${params.offset}`);
        const sujetsData = [];
        for (const sujet of sujets) {
            const author = await app.server.database.users.getIfExists({ id: sujet.author_id }, ['first_name', 'last_name', 'identifiant']);
            const matiere = await app.server.database.matieres.getIfExists({ id: sujet.matiere_id });
            const chapitre = sujet.chapitre_id ? await app.server.database.chapitres.get({ id: sujet.chapitre_id }) : null;
            try {
                const image = await (0, compression_1.compressImage)(sujet.image.toString(), {
                    quality: 75,
                    maxWidth: 800,
                    maxHeight: 800,
                }).catch(() => null);
                sujetsData.push({
                    image,
                    comment_count: sujet.comment_count,
                    id: sujet.id,
                    author: author,
                    author_id: sujet.author_id,
                    matiere_id: sujet.matiere_id,
                    chapitre: chapitre,
                    matiere: matiere,
                });
            }
            catch {
            }
        }
        const ids = sujetIds.map(x => x.id);
        const filtered_sujets = [...[...app.server.database.cache.values()].filter(x => ids.includes(x.id)), ...sujetsData].sort((a, b) => b.id - a.id);
        res.status(200).json({ data: filtered_sujets, sujets_count: await app.server.database.sujets.size() });
        sujetsData.forEach(x => {
            if (!x)
                return;
            app.server.database.cache.set(x.id, x);
        });
    });
    return "GET v1/sujets";
}
