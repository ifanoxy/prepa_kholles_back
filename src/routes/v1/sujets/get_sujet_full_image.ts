import {App} from "../../../core/App";
import {Request} from "express"
import {compressImage} from "../../../utils/compression";

export default function (app: App): string
{
    app.app.get("/v1/sujet/image/:sujet_id", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        if (!token || !await app.isAuth(token))
        {
            res.status(401).send("Unauthorized");
            return;
        }

        const sujet = await app.server.database.sujets.get({ id: Number(req.params.sujet_id) }, ['image', 'author_id', 'comment_count', 'chapitre_id', 'matiere_id', 'id']);

        try {
            res.status(200).json({
                image: sujet.image.toString()
            });
        } catch {
            res.status(200).json({});
            return;
        }

    });

    return "GET v1/sujets";
}