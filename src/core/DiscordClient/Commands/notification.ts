import {CommandInteraction, ApplicationCommandCreateOptions, Constants} from "eris";
import {DiscordClient} from "../../Discord";

export default {
    data: {
        name: 'notifications',
        description: 'Permet d\'ouvrir le gestionnaire des notifications',
        dmPermission: false,
    } as ApplicationCommandCreateOptions<false>,
    async execute(client: DiscordClient, interaction: CommandInteraction): Promise<void>
    {
        if (!interaction.guildID)return;

        const userRoles = interaction.member?.roles ?? (await client.getRESTGuildMember(interaction.guildID, interaction.user?.id ?? interaction.member!.id)).roles ?? [];
        const configRoles = client.server.config.get("roles");

        await interaction.createMessage({
            allowedMentions: undefined, content: "", poll: undefined, tts: false,
            embeds: [
                {
                    title: '🔔 Gestionnaire des notifications',
                    color: parseInt('ecec09', 16),
                    description: "Cocher les options ci-dessous afin d'obtenir un rôle et être averti lorsqu'un sujet est publié."
                }
            ],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            max_values: 7,
                            min_values: 0,
                            type: Constants.ComponentTypes.SELECT_MENU,
                            custom_id: 'notif',
                            options: [
                                {
                                    label: 'Mathématique',
                                    value: 'Mathématique',
                                    default: userRoles.includes(configRoles['Mathématiques']),
                                    emoji: {
                                        name: '🧮'
                                    }
                                },
                                {
                                    label: 'Physique',
                                    value: 'Physique',
                                    default: userRoles.includes(configRoles['Physique']),
                                    emoji: {
                                        name: '🍎'
                                    }
                                },
                                {
                                    label: 'Chimie',
                                    value: 'Chimie',
                                    default: userRoles.includes(configRoles['Chimie']),
                                    emoji: {
                                        name: '🧪'
                                    }
                                },
                                {
                                    label: 'Informatique',
                                    value: 'Informatique',
                                    default: userRoles.includes(configRoles['Informatique']),
                                    emoji: {
                                        name: '🧑‍💻'
                                    }
                                },
                                {
                                    label: 'Français',
                                    value: 'Français',
                                    default: userRoles.includes(configRoles['Français']),
                                    emoji: {
                                        name: '🇫🇷'
                                    }
                                },
                                {
                                    label: 'Anglais',
                                    value: 'Anglais',
                                    default: userRoles.includes(configRoles['Anglais']),
                                    emoji: {
                                        name: '🇬🇧'
                                    }
                                },
                                {
                                    label: 'Science Ingénieur',
                                    value: 'Science Ingénieur',
                                    default: userRoles.includes(configRoles['Science Ingénieur']),
                                    emoji: {
                                        name: '💡'
                                    }
                                },
                            ]
                        }
                    ]
                }
            ],
            flags: 64
        });
    }
}