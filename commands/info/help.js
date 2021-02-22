const { prefix } = require('../../config/bot-config.json');

module.exports = {
  name: 'help',
  description: 'Lists all of the available commands (filtered by role) or info about a specific command.',
  minNumArgs: 0,
  maxNumArgs: 1,
  expectedArgs: '<command name (optional)>',
  execute: (message, args, text) => {
    const data = [];
    const { commands } = message.client;

    if (!args.length) {
      data.push('Here is a list of my available commands: ');
      data.push(commands.map((command) => command.name).join(', '));
      data.push(`\nYou can use \'${prefix}help <command name>\' to get detailed info about a specific command!`)
    } else {
      const name = args[0].toLowerCase();
      const command = commands.get(name);

      if (!command) {
        return message.reply(`\'${name}\' is not a valid command!`);
      }

      data.push(`Name: ${command.name}`);
      if (command.description) data.push(`Description: ${command.description}`);
      if (command.usage) data.push(`Usage: ${prefix}${command.name} ${command.expectedArgs}`)
    }

    return message.author.send(data, { split: true })
      .then(() => {
        if (message.channel.type === 'dm') return;
        return message.reply('I\'ve sent you a DM with a list of my commands!');
      })
      .catch((error) => {
        console.error(`Could not send a help DM to ${message.author.tag}.\n`, error);
        return message.reply(data, { split: true });
      })
  },
};