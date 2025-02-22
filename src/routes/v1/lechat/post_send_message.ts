import { App } from '../../../core/App';
import {SystemMessage} from "@mistralai/mistralai/models/components";

async function sendMessageToMistralAI(history: { message: string, author: "Vous" | "Le chat" }[], app: App): Promise<any> {
    try {
        console.log(history)
        return await app.server.mistral.chat.complete({
            model: "mistral-small-latest",
            stream: false,
            messages: [
                {
                    role: "system",
                    content: `Réponds en français. Et envoie ton message de réponse en markdown.`
                },
                ...history.map(x => ({
                    role: x.author === "Vous" ? "user" : "assistant",
                    content: x.message
                })) as SystemMessage & { role: "user" | "assistant" },
            ]
        });
    } catch (error) {
        app.server.log.error('Erreur lors de l\'envoi de la requête à l\'API de Mistral AI :');
        app.server.log.error(error);
        throw error;
    }
}

export default function (app: App): string {
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
        } catch (error) {
            app.server.log.error('Erreur lors de l\'envoi du message à l\'API de Mistral AI :');
            app.server.log.error(error);
            res.status(500).json({ error: 'Une erreur est survenue lors de l\'envoi du message.' });
        }
    });

    return "POST v1/mistral/send_chat";
}
