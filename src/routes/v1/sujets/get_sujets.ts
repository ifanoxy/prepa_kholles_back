import {App} from "../../../core/App";
import {Request} from "express"

export default function (app: App): string
{
    app.app.get("/v1/sujets", async (req, res) => {
        const sujets = await app.server.database.sujets.getAll(undefined, ['image', 'author_id', 'chapitre_id', 'matiere_id'], { limits: 25 });

        const sujetsData = await Promise.all(sujets.map(async sujet => {
            const author = await app.server.database.users.getIfExists({ id: sujet.author_id }, ['first_name', 'last_name']);
            const matiere = await app.server.database.matieres.getIfExists({ id: sujet.matiere_id });
            const chapitre = sujet.chapitre_id ? await app.server.database.chapitres.get({ id: sujet.chapitre_id }) : null;

            return {
                image: sujet.image,
                author: author,
                chapitre: chapitre,
                matiere: matiere
            }
        }));

        res.status(200).json({ data: sujetsData });
    });

    return "GET v1/sujets";
}