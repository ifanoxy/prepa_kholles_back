import {App} from "../../../core/App";
import {Request} from "express"

export default function (app: App): string
{
    app.app.delete("/v1/chapitre/:chapitre_id", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        const user_id = token ? await app.isAuth(token) : false;
        if (!user_id || !await app.isMod(user_id))
        {
            res.status(401).send("Unauthorized");
            return;
        }
        const chapitre_id = Number(req.params.chapitre_id);

        if (!await app.server.database.chapitres.has({ id: chapitre_id }))
        {
            res.status(400).json({ code: 400 });
            return;
        }

        await app.server.database.chapitres.delete({
            id: chapitre_id,
        });

        res.status(200).json({ data: true });
    });

    return "DELETE v1/chapitre/:matiere_id";
}
