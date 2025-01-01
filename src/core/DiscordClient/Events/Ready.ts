import {DiscordClient} from "../../Discord";

export default {
    name: "ready",
    async execute(client: DiscordClient) {
        await client.loadCommands();
    },
}