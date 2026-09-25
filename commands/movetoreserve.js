const { SlashCommandBuilder } = require('discord.js');
const { moveToReserve } = require('../userRoleHelper.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('move_to_reserve')
        .setDescription('Moves inactive members to reserve')
        .addStringOption(option =>
            option.setName('message_id')
                .setDescription('The ID of the message to check for reactions.')
                .setRequired(true)),
    async execute(interaction) {
        const message_id = interaction.options.getString('message_id');
        const channel_id = interaction.channelId;
        const res = await moveToReserve(message_id, channel_id, interaction.user.id);

        await interaction.followUp({
            content: res.success ? `Successfully moved ${res.count} members to reserve.${res.failedCount ? ` (${res.failedCount} failed)` : ''}` : `Error: ${res.error}`,
            ephemeral: true
        });
    }
};
