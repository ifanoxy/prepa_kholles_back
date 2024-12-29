import {App} from "../../../core/App";
import {Request} from "express"
import {compressImage} from "../../../utils/compression";

export default function (app: App): string
{
    app.app.get("/v1/sujets", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        if (!token || !await app.isAuth(token))
        {
            res.status(401).send("Unauthorized");
            return;
        }

        const sujets = await app.server.database.sujets.getAll(undefined, ['image', 'author_id', 'comment_count', 'chapitre_id', 'matiere_id', 'id'], { limits: 25, orderBy: "id DESC" });

        const sujetsData = await Promise.all(sujets.map(async sujet => {
            const author = await app.server.database.users.getIfExists({ id: sujet.author_id }, ['first_name', 'last_name', 'identifiant']);
            const matiere = await app.server.database.matieres.getIfExists({ id: sujet.matiere_id });
            const chapitre = sujet.chapitre_id ? await app.server.database.chapitres.get({ id: sujet.chapitre_id }) : null;

            try
            {
                return {
                    image: await compressImage(sujet.image.toString(), {
                        quality: 75,
                        maxWidth: 800,
                        maxHeight: 800,
                    }).catch(() => null),
                    comment_count: sujet.comment_count,
                    id: sujet.id,
                    author: author,
                    chapitre: chapitre,
                    matiere: matiere
                }
            } catch {
                return null;
            }
        }));

        res.status(200).json({ data: sujetsData });
    });

    return "GET v1/sujets";
}