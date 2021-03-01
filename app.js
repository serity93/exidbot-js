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
client.cooldowns = new Discord.Collection();

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
  // Check if message starts with prefix or if the author is a bot
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  // Check if the user is blacklisted
  if (message.channel.type !== 'dm' && commandUtils.memberIsBlacklisted(message.member)) {
    return message.reply('You have been blacklisted and cannot execute bot commands!');
  }

  const commandArgs = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = commandArgs.shift().toLowerCase();

  const command = client.commands.find((c) => c.name.toLowerCase() === commandName) || client.commands.find((c) => c.aliases && c.aliases.map((a) => a.toLowerCase()).includes(commandName));

  if (!command) {
    return message.channel.send(`The command \'${commandName}\' does not exist! Use \'!help\' to see a list of available commands.`)
  }

  let {
    name,
    minNumArgs = 0,
    maxNumArgs = null,
    expectedArgs = '',
    guildOnly = false,
    requiredRoles = [],
    cooldown = 2,
    execute,
  } = command;

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
      reply += `\nUsage: ${prefix}${commandName} ${expectedArgs}`;
    }
    return message.channel.send(reply);
  }

  if (!client.cooldowns.has(name)) {
    client.cooldowns.set(name, new Discord.Collection());
  }

  const currentTime = Date.now();
  const timestamps = client.cooldowns.get(name);
  const cooldownMs = cooldown * 1000;

  if (timestamps.has(message.author.id)) {
    const expirationTime = timestamps.get(message.author.id) + cooldownMs;

    if (currentTime < expirationTime) {
      const remainingTime = (expirationTime - currentTime) / 1000;
      return message.reply(`Please wait ${remainingTime.toFixed(1)} more seconds before using \'${commandName}\' again!`)
    }
  }

  timestamps.set(message.author.id, currentTime);
  setTimeout(() => timestamps.delete(message.author.id), cooldownMs);

  try {
    execute(message, commandArgs, commandArgs.join(' '));
  } catch (error) {
    console.error(error);
    return message.reply('There was an error trying to execute that command!');
  }
});

client.login(process.env.TEST_TOKEN);