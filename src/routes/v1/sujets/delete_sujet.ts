import {App} from "../../../core/App";
import {Request} from "express"

export default function (app: App): string
{
    app.app.delete("/v1/sujet/:sujet_id", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        const user_id = token ? await app.isAuth(token) : false;

        if (Number.isNaN(Number(req.params.sujet_id)))
        {
            res.status(400).send("Bad Request");
            return;
        }

        const sujet_author_id = (await app.server.database.sujets.get({ id: Number(req.params.sujet_id) }, ['author_id'])).author_id;
        if (!user_id || (!await app.isMod(user_id) && sujet_author_id !== user_id))
        {
            res.status(401).send("Unauthorized");
            return;
        }

        await app.server.database.sujets.delete({
            id: Number(req.params.sujet_id),
        });

        app.server.database.cache.delete(Number(req.params.sujet_id));

        res.status(200).json({ data: true });
    });

    return "DELETE v1/sujet/:sujet_id";
}
