"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = default_1;
async function sendMessageToMistralAI(history, app) {
    try {
        console.log(history);
        return await app.server.mistral.chat.complete({
            model: "mistral-small-latest",
            stream: false,
            messages: [
                {
                    role: "system",
                    content: `Réponds en français. Et envoie ton message de réponse en markdown. pour écrire du Latex, tu devras le mettre le préfix et suffix "\`$", "$\`" ou "\`@", "\`@"`
                },
                ...history.map(x => ({
                    role: x.author === "Vous" ? "user" : "assistant",
                    content: x.message
                })),
            ]
        });
    }
    catch (error) {
        app.server.log.error('Erreur lors de l\'envoi de la requête à l\'API de Mistral AI :');
        app.server.log.error(error);
        throw error;
    }
}
function default_1(app) {
    app.app.post('/v1/mistral/send_chat', async (req, res) => {
        try {
            const token = req.headers?.authorization?.split(' ')[1];
            if (!token || !await app.isAuth(token)) {
                res.status(401).send("Unauthorized");
                return;
            }
            const { history } = req.body;
            if (!history) {
                res.status(400).send("History is required");
                return;
            }
            const response = await sendMessageToMistralAI(history, app);
            app.server.mistral_tokens.remaining -= response.usage.totalTokens;
            res.status(200).json({ response: response.choices[0]?.message?.content, tokens: app.server.mistral_tokens });
        }
        catch (error) {
            app.server.log.error('Erreur lors de l\'envoi du message à l\'API de Mistral AI :');
            app.server.log.error(error);
            res.status(500).json({ error: 'Une erreur est survenue lors de l\'envoi du message.' });
        }
    });
    return "POST v1/mistral/send_chat";
}
