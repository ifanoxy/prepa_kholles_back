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

        res.status(200).json({ data: demosData.map(x => ({...x, pdf: x?.pdf?.toString() ?? null })) });
    });

    return "GET v1/demonstrations";
}