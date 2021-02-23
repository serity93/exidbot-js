module.exports = {
  name: 'server',
  aliases: ['info', 'serverInfo'],
  description: 'Provides basic server info.',
  guildOnly: true,
  execute: (message, args, text) => {
    message.channel.send(`This server's name is: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`);
  },
};