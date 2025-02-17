import {App} from "../../../core/App";
import {Request} from "express"
import {compressImage} from "../../../utils/compression";
import {log} from "node:util";

export default function (app: App): string
{
    app.app.get("/v1/demonstrations", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        if (!token || !await app.isAuth(token))
        {
            res.status(401).send("Unauthorized");
            return; 
        }

        const demosData = await app.server.database.demonstration.getAll();

        res.status(200).json({ data: await Promise.all(demosData.map(async x => ({...x, pdf: x?.pdf?.toString() ?? null, author: x.author_id ? await app.server.database.users.get({ id: x.author_id }) : null }))) });
    });

    return "GET v1/demonstrations";
}