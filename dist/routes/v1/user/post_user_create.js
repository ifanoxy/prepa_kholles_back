"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
const UserPermissions_1 = require("../../../types/UserPermissions");
function default_1(app) {
    app.app.post("/v1/user/create", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        const user_id = token ? await app.isAuth(token) : false;
        if (!user_id || !await app.isMod(user_id)) {
            res.status(401).send("Unauthorized");
            return;
        }
        const errors = app.checkBodyParam(["last_name", "first_name", "identifiant", "password", "permission"], req.body);
        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }
        if (await app.server.database.users.getIfExists({ identifiant: req.body.identifiant })) {
            res.status(400).json({ message: "User already exists" });
            return;
        }
        let permission;
        switch (req.body.permission) {
            case "Administrateur":
                permission = UserPermissions_1.UserPermissions.ADMINISTRATEUR;
                break;
            case "Administratrice":
                permission = UserPermissions_1.UserPermissions.ADMINISTRATRICE;
                break;
            case "Modérateur":
                permission = UserPermissions_1.UserPermissions.MODERATEUR;
                break;
            case "Modératrice":
                permission = UserPermissions_1.UserPermissions.MODERATRICE;
                break;
            case "Enseignant":
                permission = UserPermissions_1.UserPermissions.ENSEIGNANT;
                break;
            case "Enseignante":
                permission = UserPermissions_1.UserPermissions.ENSEIGNANTE;
                break;
            default:
                permission = UserPermissions_1.UserPermissions.DEFAULT;
                break;
        }
        const result = await app.server.database.users.insert({
            id: null,
            last_name: req.body.last_name,
            first_name: req.body.first_name,
            identifiant: req.body.identifiant,
            permission: permission,
            password: await app.hash_password(req.body.password),
            group: req.body.group
        });
        res.status(200).json({ data: {
                id: result.insertId
            }
        });
    });
    return "POST v1/user/:create";
}
