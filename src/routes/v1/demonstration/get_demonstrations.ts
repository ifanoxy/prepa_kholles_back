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

        const params = {
            before_id: !Number.isNaN(Number(req.query?.before_id)) ? Number(req.query.before_id) : null,
            matiere_id: req.query?.matiere_id ? Number(req.query.matiere_id) : null,
            limit: req.query?.limit ? (Number(req.query.limit) <= 100 ? Number(req.query.limit) : 20) : 20,
            offset: req.query?.offset ? Number(req.query?.offset) : 0,
            light: req.query?.light ? Boolean(req.query?.light) : false
        }

        if (!params.light)
            params.limit = params.limit >= 20 ? params.limit : 20;

        function diffDays(date1: Date, date2: Date): number {
            const differenceEnMs = date2.getTime() - date1.getTime();
            return Math.floor(differenceEnMs / (1000 * 60 * 60 * 24));
        }

        const demosData = await app.server.database.demonstration.getAll(undefined, params.light ? ["name", "id"] : '*', { limits: params.limit, offset: params.offset, orderBy: "id DESC", beforeId: params.before_id });

        const remaining_day = user.permission == UserPermissions.DEFAULT ? diffDays(new Date(user.last_post_date as string), new Date()) : 0;

        if (params.light)
            res.status(200).json({
                data: 14 - remaining_day >= 0 ? demosData : [],
            })
        else res.status(200).json({
            data: 14 - remaining_day >= 0 ? await Promise.all(demosData.map(async x => ({...x, pdf: x?.pdf?.toString() ?? null, author: x.author_id ? await app.server.database.users.get({ id: x.author_id }, ['id', 'last_name', 'first_name']) : null}))) : [],
            remaining_day: 14 - remaining_day
        });
    });

    return "GET v1/demonstrations";
}