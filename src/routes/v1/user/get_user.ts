import {App} from "../../../core/App";
import {Request} from "express"

export default function (app: App): string
{
    app.app.get("/v1/user", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        if (!token || !await app.isAuth(token))
        {
            res.status(401).send("Unauthorized");
            return;
        }

        let user;
        if (req.query?.identifiant)
            user = await app.server.database.users.getIfExists({
                identifiant: req.query.identifiant as string
            }, ["first_name", "last_name", "group", "permission", 'identifiant', 'class', 'phone_number']);
        else {
            user = await app.server.database.users.getIfExists({
                id: await app.getUserIdByToken(req.headers.authorization!.split(" ")[1]) as number
            }, ["first_name", "last_name", "group", "permission", 'identifiant', 'class', 'phone_number']);
        }

        if (!user){
            res.status(400).send({ data: null });
            return;
        }

        const perm = await app.server.database.permissions.getIfExists({ id: user.permission }, ["name"]);

        res.status(200).json({ data: { user, permission: perm?.name ?? "Aucune" } });
    });

    return "GET v1/user";
}

interface UserAuthData {
    first_name: string;
    last_name: string;
}
