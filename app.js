const Discord = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');
const { prefix } = require('./config/bot-config.json');
const commandUtils = require('./utils/command-utils');

/*
A Discord bot written specifically for the EXID Discord server.

Bot owner & main contributor:
  Sean Tyler (sean#0419) (https://github.com/serity93/exidbot-js)
*/

dotenv.config();

const client = new Discord.Client();
client.commands = new Discord.Collection();

client.once('ready', () => {
  console.log('Loading commands...');
  const readCommands = (dir) => {
    const files = fs.readdirSync(path.join(__dirname, dir));
    for (const file of files) {
      const stat = fs.lstatSync(path.join(__dirname, dir, file));
      if (stat.isDirectory()) {
        readCommands(path.join(dir, file));
      } else {
        const command = require(path.join(__dirname, dir, file));
        console.log(file, command);
        client.commands.set(command.name, command);
      }
    }
  };

  readCommands('commands');

  console.log('Ready!');
});

client.on('message', (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  if (message.channel.type !== 'dm' && commandUtils.memberIsBlacklisted(message.member)) {
    return message.reply('You have been blacklisted and cannot execute bot commands!');
  }

  const commandArgs = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = commandArgs.shift().toLowerCase();

  // TODO: Implement help command and send reply when command not found
  if (!client.commands.has(commandName)) return;

  let {
    name,
    minNumArgs = 0,
    maxNumArgs = null,
    expectedArgs = '',
    guildOnly = false,
    requiredRoles = [],
    execute,
  } = client.commands.get(commandName);

  // Check if command can be executed in DMs
  if (message.channel.type === 'dm' && (guildOnly || requiredRoles.length)) {
    return message.reply('Cannot execute that command in DMs!');
  }

  if (typeof requiredRoles === 'string') {
    requiredRoles = [requiredRoles];
  }

  // Check if server and member have required roles
  for (const requiredRole of requiredRoles) {
    if (!commandUtils.serverHasRequiredRole(message.guild, requiredRole) || !commandUtils.memberHasRequiredRole(message.member, requiredRole)) {
      return message.reply(`You must have the role \'${requiredRole.name}\' to use this command!`);
    }
  }

  // Check if user provided the correct number of args
  if (!commandUtils.messageHasCorrectNumArgs(commandArgs, minNumArgs, maxNumArgs)) {
    let reply = 'Incorrect number of arguments provided!'
    if (expectedArgs) {
      reply += `\nUsage: ${prefix}${name} ${expectedArgs}`;
    }
    return message.channel.send(reply);
  }

  try {
    execute(message, commandArgs, commandArgs.join(' '));
  } catch (error) {
    console.error(error);
    return message.reply('There was an error trying to execute that command!');
  }
});

client.login(process.env.TEST_TOKEN);