import {App} from "../../../core/App";
import {Request} from "express"

export default function (app: App): string
{
    app.app.post("/v1/chapitre/:matiere_id", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        const user_id = token ? await app.isAuth(token) : false;
        if (!token || !user_id)
        {
            res.status(401).send("Unauthorized");
            return;
        }
        const errors = app.checkBodyParam(["name"], req.body);

        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }

        const matiere_id = Number(req.params.matiere_id);

        if (!await app.server.database.matieres.has({ id: matiere_id }))
        {
            res.status(400).json({ code: 400 });
            return;
        }

        const result = await app.server.database.chapitres.insert({
            id: null,
            matiere_id: Number(req.params.matiere_id),
            name: req.body.name
        });

        res.status(200).json({ data: {
            id: result.insertId
            }
        });
    });

    return "POST v1/chapitre/:matiere_id";
}
