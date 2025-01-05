import {App} from "../../../core/App";
import {Request} from "express"

export default function (app: App): string
{
    app.app.get("/v1/users/mod", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        const user_id = token ? await app.isAuth(token) : null
        if (!user_id || !await app.isMod(user_id))
        {
            res.status(401).send("Unauthorized");
            return;
        }

        const users = await app.server.database.users.getAll(undefined, ["first_name", "last_name", "group", 'id', 'identifiant', 'permission']);

        const data = [];
        for (const x of users) {
            const permission = await app.server.database.permissions.get({ id: x.permission });
            const sujetSended = await app.server.database.sujets.size({ author_id: x.id });
            const commentSended = await app.server.database.comments.size({ author_id: x.id });

            data.push({
                ...x,
                permission: permission,
                stats: {
                    sujet_sended: sujetSended,
                    comment_sended: commentSended,
                },
            });
        }

        res.status(200).json({ data });

    });

    return "GET v1/users";
}

interface UserAuthData {
    first_name: string;
    last_name: string;
}
