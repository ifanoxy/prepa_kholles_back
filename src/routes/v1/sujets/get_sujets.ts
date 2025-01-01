import {App} from "../../../core/App";
import {compressImage} from "../../../utils/compression";
import {log} from "node:util";
import {SujetsKeys, SujetsPrimaryKeys} from "../../../types/schemas/Sujets";

export default function (app: App): string
{
    app.app.get("/v1/sujets", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        if (!token || !await app.isAuth(token))
        {
            res.status(401).send("Unauthorized");
            return;
        }

        const params = {
            limit: req.query?.limit ? (Number(req.query.limit) <= 50 ? Number(req.query.limit) : 25) : 25,
            offset: req.query?.offset ? Number(req.query?.offset) : 0,
        }

        const sujetIds = await app.server.database.sujets.getAll(undefined, ['id'], { limits: params.limit, offset: params.offset, orderBy: "id DESC" });

        const cachedSujetIds = Array.from(app.server.database.cache.keys());
        console.log(cachedSujetIds)
        const sujetIdsNotCached = sujetIds.map(x => x.id).filter(x => !cachedSujetIds.includes(x) ) ;

        const sujets = sujetIdsNotCached.length === 0 ? await app.server.database.query(`SELECT \`image\`, \`author_id\`, \`comment_count\`, \`chapitre_id\`, \`matiere_id\`, \`id\` FROM \`sujets\` WHERE ${sujetIdsNotCached.map(x => `id=${x}`).join(' OR ')} LIMIT ${params.limit} OFFSET ${params.offset}`) as (SujetsPrimaryKeys & SujetsKeys)[] : []

        const sujetsData = (await Promise.all(sujets.map(async sujet => {
            const author = await app.server.database.users.getIfExists({ id: sujet.author_id }, ['first_name', 'last_name', 'identifiant']);
            const matiere = await app.server.database.matieres.getIfExists({ id: sujet.matiere_id });
            const chapitre = sujet.chapitre_id ? await app.server.database.chapitres.get({ id: sujet.chapitre_id }) : null;

            try {
                return {
                    image: await compressImage(sujet.image.toString(), {
                        quality: 75,
                        maxWidth: 800,
                        maxHeight: 800,
                    }).catch(() => null) as string,
                    comment_count: sujet.comment_count,
                    id: sujet.id,
                    author: author,
                    author_id: sujet.author_id,
                    matiere_id: sujet.matiere_id,
                    chapitre: chapitre,
                    matiere: matiere
                }
            } catch {
                return undefined;
            }
        }))).filter(x => x);

        sujetsData.forEach(x => {
            if (!x)return;
            app.server.database.cache.set(x.id, x)
        });

        console.log([...app.server.database.cache.values(), ...sujetsData])

        res.status(200).json({ data: [...app.server.database.cache.values(), ...sujetsData] });
    });

    return "GET v1/sujets";
}
