import {App} from "../../../core/App";
import {Request} from "express"

export default function (app: App): string
{
    app.app.post("/v1/user/gen_token", async (req: Request<{}, {}, UserGenTokenBody>, res) => {
        const errors = app.checkBodyParam(["password", "identifiant"], req.body);

        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }

        const hashed_password = await app.hash_password(req.body.password);

        const user = await app.server.database.users.getIfExists({
            identifiant: req.body.identifiant,
            password: hashed_password
        }).catch(() => null);

        if (!user)
        {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const token = app.generateAPIToken(user.id.toString(), hashed_password);

        res.status(200).json({ token })
    });

    return "POST v1/user/gen_token";
}

interface UserGenTokenBody {
    identifiant: string,
    password: string,
}
