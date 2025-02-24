import {App} from "../../../core/App";
import {UserPermissions} from "../../../types/UserPermissions";

export default function (app: App): string
{
    app.app.get("/v1/demonstrations", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        const user_id = token ? await app.isAuth(token) : null;
        const user = user_id ? await app.server.database.users.getIfExists({ id: user_id }, ['last_post_date', 'permission']) : null;
        if (!user_id || !user)
        {
            res.status(401).send("Unauthorized");
            return; 
        }

        function diffDays(date1: Date, date2: Date): number {
            const differenceEnMs = date2.getTime() - date1.getTime();
            return Math.floor(differenceEnMs / (1000 * 60 * 60 * 24));
        }


        const demosData = await app.server.database.demonstration.getAll();

        const remaining_day = user.permission == UserPermissions.DEFAULT ? diffDays(new Date(user.last_post_date as string), new Date()) : 0;

        res.status(200).json({
            data: 14 - remaining_day >= 0 ? await Promise.all(demosData.map(async x => ({...x, pdf: x?.pdf?.toString() ?? null, author: x.author_id ? await app.server.database.users.get({ id: x.author_id }) : null}))) : [],
            remaining_day: 14 - remaining_day
        });
    });

    return "GET v1/demonstrations";
}