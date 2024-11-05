import {App} from "../../../core/App";
import {Request} from "express"

export default function (app: App): string
{
    app.app.post("/v1/user/auth", async (req: Request<{}, {}, UserAuthBody>, res) => {
        const errors = [];

        if (!((req.body.token) || (req.body.first_name && req.body.last_name && req.body.password)))
            errors.push({
                field: "first_name & last_name & password |  token",
                message: `first_name et last_name et password ou token sont requis.`
            })

        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }

        let valid_token;
        if (req.body.token)
            valid_token = await app.getUserIdByToken(req.body.token);
        else
        {
            const user = await app.server.database.users.getIfExists({ first_name: req.body.first_name, last_name: req.body.last_name });

            if (!user || !await app.checkHashPassword(req.body.password as string, user.password))
            {
                res.status(400).json({
                    message: `Unauthorized`,
                });
                return;
            }

            valid_token = app.generateAPIToken(user.id, user.password);
        }

        res.status(200).json({ [req.body.token ? 'user_id' : 'token']: valid_token });
    });

    return "POST v1/user/auth";
}

interface UserAuthBody {
    token?: string,
    first_name?: string,
    last_name?: string,
    password?: string,
}
