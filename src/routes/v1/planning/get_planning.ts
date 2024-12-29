import {App} from "../../../core/App";
import {Request} from "express"
import {compressImage} from "../../../utils/compression";

export default function (app: App): string
{
    app.app.get("/v1/planning", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        if (!token || !await app.isAuth(token))
        {
            res.status(401).send("Unauthorized");
            return;
        }

        const planning = await app.server.database.planning.getAll(undefined, '*');

        res.status(200).json({ data: planning });
    });

    return "GET v1/sujets";
}