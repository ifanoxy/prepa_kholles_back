import {App} from "../../../core/App";
import {Request} from "express"

export default function (app: App): string
{
    app.app.post("/v1/programmes/create", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        const user_id = token ? await app.getUserIdByToken(token) : false;
        if (!user_id || !await app.isMod(user_id))
        {
            res.status(401).send("Unauthorized");
            return;
        }

        const errors = app.checkBodyParam(["matiere_id", "pdf", 'week'], req.body);

        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }

        await app.server.database.programmes.insert({
            id: null,
            matiere_id: req.body.matiere_id,
            pdf: req?.body?.pdf,
            week: req.body.week,
        });

        res.status(200).json({ message: `Successfully created` });
    });

    return "POST v1/programmes/create";
}