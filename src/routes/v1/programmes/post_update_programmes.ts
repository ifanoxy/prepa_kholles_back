import {App} from "../../../core/App";
import {Request} from "express"

export default function (app: App): string
{
    app.app.post("/v1/programmes/update", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        const user_id = token ? await app.getUserIdByToken(token) : false;
        if (!user_id || !await app.isMod(user_id))
        {
            res.status(401).send("Unauthorized");
            return;
        }

        const errors = app.checkBodyParam(["id"], req.body);

        const { id, new_matiere_id, new_week, new_pdf } = req.body;

        let values: Partial<{ matiere_id: number, week: number, pdf: string}> = {};

        if (new_matiere_id)
            values['matiere_id'] = new_matiere_id;
        if (new_week)
            values['week'] = new_week;
        if (new_pdf)
            values['pdf'] = new_pdf;

        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }

        await app.server.database.programmes.update({ id }, values);

        res.status(200).json({ message: `Successfully updated` });
    });

    return "POST v1/demonstration/update";
}