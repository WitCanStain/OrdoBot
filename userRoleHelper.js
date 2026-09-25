const { client } = require('./client.js');
const approveUser = async (user_id, cmd_user_id) => {
    console.log(`user_id: ${JSON.stringify(user_id)}`)
    console.log(`cmd_user_id: ${JSON.stringify(cmd_user_id)}`)
    try {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        // console.log(`guild: ${JSON.stringify(guild)}`);
        let member = await guild.members.fetch(user_id);
        let cmd_member = await guild.members.fetch(cmd_user_id);
        if (!member) console.log(`Member ${user_id} not found!`);
        if(!cmd_member.guild.roles.cache.some(role => role.id == process.env.OFFICER_ROLE_ID)){
            console.error(`User ${cmd_user_id} does not have permission to use this command.`)
            return false;
        }
        console.info(`Member ${cmd_user_id} has command privilege.`);
        let promises = [];
        const assignment_role = member.guild.roles.cache.find(role => role.id == process.env.ASSIGNMENT_CATEGORY_ROLE_ID);
        const accolades_role = member.guild.roles.cache.find(role => role.id == process.env.ACCOLADES_CATEGORY_ROLE_ID);
        const rank_role = member.guild.roles.cache.find(role => role.id == process.env.RANK_CATEGORY_ROLE_ID);
        const medals_role = member.guild.roles.cache.find(role => role.id == process.env.MEDALS_CATEGORY_ROLE_ID);
        const misc_role = member.guild.roles.cache.find(role => role.id == process.env.MISC_CATEGORY_ROLE_ID);
        const member_role = member.guild.roles.cache.find(role => role.id == process.env.MEMBER_ROLE_ID);
        const initiate_role = member.guild.roles.cache.find(role => role.id == process.env.INITIATE_ROLE_ID);
        const visitor_role = member.guild.roles.cache.find(role => role.id == process.env.VISITOR_ROLE_ID);
        const applicant_role = member.guild.roles.cache.find(role => role.id == process.env.APPLICANT_ROLE_ID);
        const active_role = member.guild.roles.cache.find(role => role.id == process.env.ACTIVE_ROLE_ID);
        for (const role_to_add of [assignment_role, accolades_role, rank_role, medals_role, misc_role, member_role, initiate_role, active_role]) {
            if (role_to_add) promises.push(member.roles.add(role_to_add));
        }
        promises.push(member.roles.remove(visitor_role))
        promises.push(member.roles.remove(applicant_role))
        const current_nickname = member.displayName;
        console.log(`current nickname: ${current_nickname}`);
        await member.setNickname(`[ORDER] ${current_nickname}`);
        await Promise.all(promises);            
        return true;
    } catch (e) {
        console.error(e)
        return false;
    }
    
}

const moveToReserve = async (message_id, channel_id, cmd_user_id) => {
    try {
        const guild = client.guilds.cache.get(process.env.GUILD_ID);
        let cmd_member = await guild.members.fetch(cmd_user_id);
        
        if (!cmd_member.roles.cache.has(process.env.GRAND_COUNCIL_ROLE_ID)) {
            return { success: false, error: 'User does not have the GRAND_COUNCIL_ROLE_ID permission.' };
        }

        const channel = await guild.channels.fetch(channel_id);
        const message = await channel.messages.fetch(message_id);
        
        // Collect all users who reacted
        const reactedUsers = new Set();
        for (const reaction of message.reactions.cache.values()) {
            const users = await reaction.users.fetch();
            users.forEach(user => reactedUsers.add(user.id));
        }

        await guild.members.fetch(); // Ensure all members are cached

        const memberRoleId = process.env.MEMBER_ROLE_ID;
        const reserveRoleId = process.env.RESERVE_ROLE_ID;

        const membersToMove = guild.members.cache.filter(member =>
            member.roles.cache.has(memberRoleId) && !reactedUsers.has(member.id)
        );

        // Tie each member's remove+add together so partial failures don't get miscounted as success
        const results = await Promise.allSettled(
            membersToMove.map(member => member.roles.remove(memberRoleId).then(() => member.roles.add(reserveRoleId)))
        );

        const movedCount = results.filter(r => r.status === 'fulfilled').length;
        const failedCount = results.length - movedCount;

        return { success: true, count: movedCount, failedCount };
    } catch (e) {
        console.error(e);
        return { success: false, error: e.message };
    }
}

module.exports = { approveUser, moveToReserve }