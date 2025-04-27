"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const UserPermissions_1 = require("../../../types/UserPermissions");
function default_1(app) {
    app.app.get("/v1/demonstration/:id", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        const user_id = token ? await app.isAuth(token) : null;
        const user = user_id ? await app.server.database.users.getIfExists({ id: user_id }, ['last_post_date', 'permission']) : null;
        if (!user_id || !user) {
            res.status(401).send("Unauthorized");
            return;
        }
        function diffDays(date1, date2) {
            const differenceEnMs = date2.getTime() - date1.getTime();
            return Math.floor(differenceEnMs / (1000 * 60 * 60 * 24));
        }
        const demoData = await app.server.database.demonstration.getIfExists({
            id: Number(req.params.id)
        });
        const remaining_day = user.permission == UserPermissions_1.UserPermissions.DEFAULT ? diffDays(new Date(user.last_post_date), new Date()) : 0;
        res.status(200).json({
            data: 14 - remaining_day >= 0 ? demoData : null,
            remaining_day: 14 - remaining_day
        });
    });
    return "GET v1/demonstrations";
}
