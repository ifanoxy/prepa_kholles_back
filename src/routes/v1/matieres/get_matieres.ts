import {App} from "../../../core/App";
import {Request} from "express"

export default function (app: App): string
{
    app.app.get("/v1/matieres", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        if (!token || !await app.isAuth(token))
        {
            res.status(401).send("Unauthorized");
            return;
        }

        const users = await app.server.database.matieres.getAll(undefined, ['name', 'id']);

        res.status(200).json({ data: users });
    });

    return "GET v1/matieres";
}

interface UserAuthData {
    first_name: string;
    last_name: string;
}
