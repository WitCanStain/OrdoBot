const { SlashCommandBuilder } = require('discord.js');
const { approveUser } = require('../userRoleHelper.js');
module.exports = {
    data: new SlashCommandBuilder()
    .setName('approve_join')
    .setDescription('Accepts a user\'s application and gives them appropriate roles.')
    .addStringOption(option =>
		option.setName('user_id')
			.setDescription('The id of the user whose application is being approved.')
            .setRequired(true)),
//    .setDescription('Whether or not the response should be visible only to you'),
    async execute(interaction) {
        const user_id = interaction.options.getString('user_id');
        let res = await approveUser(user_id, interaction.user.id);
        if (res) {
            await interaction.channel.send({ content: 
            
                `Welcome to the Order, <@${user_id}>. Your application has been approved!

                Please have a look at [this](https://cdn.discordapp.com/attachments/1549112173194780772/1549112388639395912/orderplan1.png?ex=6aa982d6&is=6aa83156&hm=1798889409b12cc2cd9b79a6f7a11451755ac8988c2c9b2fc71803b3b01f240e&) overview of the Order's structure and progression system. You can find in-depth information about how the Order is organised [here](https://discord.com/channels/1090571033712541706/1549110186827059373/1549111780213530706), but you don't need to worry about the rest of it for now. For now, your main task is to just play the game and join us for events.

                You are now a levy, a provisional member. By attending events and contributing to the clan, you will reach the rank of Templar and become a full member. When you do, you are expected to choose an assignment in the military. You will also be able to choose whether you want to focus on the military, logistics, community service, or all three.

                Have a read through the rules of the Order and the server [here](https://discord.com/channels/1090571033712541706/1090908358481035345/1091035786717175928) if you haven't already.

                For general guidance on the game, see the <#1549762304462159912> channel.`
            });
        }
        await interaction.followUp({content:res?'User successfully approved':'Error occurred, approving failed.', ephemeral:true});
    }
};