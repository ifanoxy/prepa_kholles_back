import {DiscordClient} from "../../Discord";
import {AnyInteraction, Constants} from "eris";

export default {
    name: "interactionCreate",
    async execute(client: DiscordClient, interaction: AnyInteraction) {
        switch (interaction.type) {
            case Constants.InteractionTypes.APPLICATION_COMMAND: {
                const command = client.handler.commands.get(interaction.data.name);
                if (command) command.execute(client, interaction);
            }break;
            case Constants.InteractionTypes.MESSAGE_COMPONENT: {
                switch (interaction.data.component_type) {
                    case Constants.ComponentTypes.SELECT_MENU: {
                        const select = client.handler.select.get(interaction.data.custom_id);
                        if (select) select.execute(client, interaction);
                    }
                }
            }
        }
    },
}