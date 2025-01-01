"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eris_1 = require("eris");
exports.default = {
    name: "interactionCreate",
    async execute(client, interaction) {
        switch (interaction.type) {
            case eris_1.Constants.InteractionTypes.APPLICATION_COMMAND:
                {
                    const command = client.handler.commands.get(interaction.data.name);
                    if (command)
                        command.execute(client, interaction);
                }
                break;
            case eris_1.Constants.InteractionTypes.MESSAGE_COMPONENT: {
                switch (interaction.data.component_type) {
                    case eris_1.Constants.ComponentTypes.SELECT_MENU: {
                        const select = client.handler.select.get(interaction.data.custom_id);
                        if (select)
                            select.execute(client, interaction);
                    }
                }
            }
        }
    },
};
