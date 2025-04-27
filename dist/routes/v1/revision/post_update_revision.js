"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(app) {
    app.app.post("/v1/revision/update", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        const user_id = token ? await app.getUserIdByToken(token) : false;
        if (!user_id || !await app.isMod(user_id)) {
            res.status(401).send("Unauthorized");
            return;
        }
        const errors = app.checkBodyParam(["id"], req.body);
        const { id, new_name, new_week, new_text, new_demo_id } = req.body;
        let values = {};
        if (new_name)
            values['name'] = new_name;
        if (new_week)
            values['week'] = new_week;
        if (new_text)
            values['text'] = new_text;
        if (new_demo_id)
            values['demo_id'] = new_demo_id;
        if (errors.length > 0 || Object(values).length == 0) {
            res.status(400).json({ errors });
            return;
        }
        await app.server.database.revision.update({ id }, values);
        res.status(200).json({ message: `Successfully updated` });
    });
    return "POST v1/revision/update";
}
