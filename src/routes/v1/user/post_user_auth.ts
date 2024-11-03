import {App} from "../../../core/App";
import {Request} from "express"

export default function (app: App): string
{
    app.app.post("/v1/user/auth", async (req: Request<{}, {}, UserAuthBody>, res) => {
        const errors = app.checkBodyParam(['token', 'user_id'], req.body);

        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }

        const valid_token = await app.getUserIdByToken(req.body.token);

        res.status(200).json({ valid: valid_token === Number(req.body.user_id) });
    });

    return "POST v1/user/auth";
}

interface UserAuthBody {
    token: string,
    user_id: string,
}
