"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const eris_1 = require("eris");
exports.default = {
    custom_id: 'notif',
    async execute(client, interaction) {
        if (!interaction.guildID)
            return;
        const data = interaction.data;
        const configRoles = client.server.config.get('roles');
        const userRoles = interaction.member?.roles ?? (await client.getRESTGuildMember(interaction.guildID, interaction.user?.id ?? interaction.member.id)).roles ?? [];
        const roles = data.values.map(x => configRoles[x]);
        const removedRoles = userRoles.filter(x => Object.values(configRoles).includes(x)).filter(x => !roles.includes(x));
        for (let role of roles) {
            await client.addGuildMemberRole(interaction.guildID, interaction.user?.id ?? interaction.member?.id ?? '', role, 'Commande /notification');
        }
        for (let role of removedRoles) {
            await client.removeGuildMemberRole(interaction.guildID, interaction.user?.id ?? interaction.member?.id ?? '', role, 'Commande /notification');
        }
        await interaction.editParent({
            embeds: [
                {
                    title: '🔔 Gestionnaire des notifications',
                    color: parseInt('ecec09', 16),
                    description: roles.length === 0 ? 'Vous ne suivez plus aucune notification' : (roles.length === 1 ? `Vous suivez uniquement les notifications de <@&${roles[0]}>` : `Vous suivez les notifications ${roles.map(x => `<@&${x}>`).join(', ')}.`)
                }
            ],
            components: [
                {
                    type: 1,
                    components: [
                        {
                            max_values: 7,
                            min_values: 0,
                            type: eris_1.Constants.ComponentTypes.SELECT_MENU,
                            custom_id: 'notif',
                            options: [
                                {
                                    label: 'Mathématique',
                                    value: 'Mathématique',
                                    default: roles.includes(configRoles['Mathématiques']),
                                    emoji: {
                                        name: '🧮'
                                    }
                                },
                                {
                                    label: 'Physique',
                                    value: 'Physique',
                                    default: roles.includes(configRoles['Physique']),
                                    emoji: {
                                        name: '🍎'
                                    }
                                },
                                {
                                    label: 'Chimie',
                                    value: 'Chimie',
                                    default: roles.includes(configRoles['Chimie']),
                                    emoji: {
                                        name: '🧪'
                                    }
                                },
                                {
                                    label: 'Informatique',
                                    value: 'Informatique',
                                    default: roles.includes(configRoles['Informatique']),
                                    emoji: {
                                        name: '🧑‍💻'
                                    }
                                },
                                {
                                    label: 'Français',
                                    value: 'Français',
                                    default: roles.includes(configRoles['Français']),
                                    emoji: {
                                        name: '🇫🇷'
                                    }
                                },
                                {
                                    label: 'Anglais',
                                    value: 'Anglais',
                                    default: roles.includes(configRoles['Anglais']),
                                    emoji: {
                                        name: '🇬🇧'
                                    }
                                },
                                {
                                    label: 'Science Ingénieur',
                                    value: 'Science Ingénieur',
                                    default: roles.includes(configRoles['Science Ingénieur']),
                                    emoji: {
                                        name: '💡'
                                    }
                                },
                            ]
                        }
                    ]
                }
            ]
        });
    }
};
