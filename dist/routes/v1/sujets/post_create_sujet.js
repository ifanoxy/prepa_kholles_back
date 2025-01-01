"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
function default_1(app) {
    app.app.post("/v1/sujets/create", async (req, res) => {
        const token = req.headers?.authorization?.split(' ')[1];
        if (!token || !await app.isAuth(token)) {
            res.status(401).send("Unauthorized");
            return;
        }
        const errors = app.checkBodyParam(["matiere_id", "image"], req.body);
        if (errors.length > 0) {
            res.status(400).json({ errors });
            return;
        }
        const user_id = await app.getUserIdByToken(req.headers?.authorization.split(' ')[1]);
        if (!user_id) {
            res.status(401).send("Unauthorized");
            return;
        }
        await app.server.database.sujets.insert({
            id: null,
            matiere_id: req.body.matiere_id,
            author_id: user_id,
            image: req.body.image,
            chapitre_id: req.body.chapitre_id ? req.body.chapitre_id : null
        });
        res.status(200).json({ message: `Successfully created` });
        if (app.server.discord) {
            const channel_id = app.server.config.get("sujet_channel_id");
            const userData = await app.server.database.users.get({ id: user_id }, ["identifiant"]);
            const matiere = await app.server.database.matieres.get({ id: req.body.matiere_id }, ["name"]);
            const chapitre = req.body.chapitre_id ? await app.server.database.chapitres.get({ id: req.body.chapitre_id }, ["name"]) : null;
            const sfbuff = Buffer.from(req.body.image.split(",")[1], "base64");
            await app.server.discord.createMessage(channel_id, {
                content: `<@&${app.server.config.get('roles')[matiere.name]}> Nouveau sujet de Khôlles disponible !`,
                embeds: [
                    {
                        url: 'https://mp2i-roosevelt.fr/',
                        title: `Sujet Khôlles ${matiere.name}`,
                        description: chapitre ? `${chapitre.name}` : "",
                        color: Number.parseInt("c54f4f", 16),
                        image: {
                            url: "attachment://sujet.png",
                        },
                        footer: {
                            text: `Publié par ${userData.identifiant}`,
                        },
                        timestamp: new Date(),
                    }
                ]
            }, {
                file: sfbuff,
                name: 'sujet.png'
            });
        }
    });
    return "POST v1/sujets/create";
}
