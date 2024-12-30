import {App} from "../../../core/App";
import {Request} from "express"

export default function (app: App): string
{
    app.app.delete("/v1/user/delete/:user_id", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        const user_id = token ? await app.isAuth(token) : false;
        if (!user_id || !await app.isMod(user_id))
        {
            res.status(401).send("Unauthorized");
            return;
        }
        const user_id2 = Number(req.params.user_id);

        if (!await app.server.database.users.has({ id: user_id2 }))
        {
            res.status(400).json({ code: 400 });
            return;
        }

        await app.server.database.users.delete({
            id: user_id2,
        });

        res.status(200).json({ data: true });
    });

    return "DELETE v1/user/:user_id";
}
