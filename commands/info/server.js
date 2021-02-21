module.exports = {
  name: 'server',
  description: 'Provides basic server info.',
  guildOnly: true,
  execute: (message, args) => {
    message.channel.send(`This server's name is: ${message.guild.name}\nTotal members: ${message.guild.memberCount}`);
  },
};