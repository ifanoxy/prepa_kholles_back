import {App} from "../../../core/App";
import {Request} from "express"

export default function (app: App): string
{
    app.app.post("/v1/sujets/create", async (req, res) => {
        const errors = app.checkBodyParam(["matiere_id", "image"], req.body);

        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }

        const user_id = await app.getUserIdByToken(req.headers?.authorization!.split(' ')[1]);


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