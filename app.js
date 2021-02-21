const Discord = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const { prefix } = require('./config/bot-config.json');
const { hasCorrectNumArgs } = require('./utils/commandUtils');

/*
A Discord bot written specifically for the EXID Discord server.

Bot owner & main contributor:
  Sean Tyler (sean#0419) (https://github.com/serity93/exidbot-js)
*/

dotenv.config();

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFolders = fs.readdirSync('./commands');
for (const folder of commandFolders) {
  const commandFiles = fs.readdirSync(`./commands/${folder}`).filter((file) => file.endsWith('.js'));
  for (const file of commandFiles) {
    const command = require(`./commands/${folder}/${file}`);
    client.commands.set(command.name, command);
  }
}

client.once('ready', () => {
  console.log('Ready!');
});

client.on('message', (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const commandArgs = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = commandArgs.shift().toLowerCase();

  if (!client.commands.has(commandName)) return;

  const command = client.commands.get(commandName);

  if (command.guildOnly && message.channel.type === 'dm') {
    return message.reply('Cannot execute that command in DMs!');
  }

  if (!hasCorrectNumArgs(command, commandArgs)) {
    let reply = 'Incorrect number of arguments provided!'
    if (command.usage) {
      reply += `\nUsage: ${prefix}${command.name} ${command.usage}`;
    }
    return message.channel.send(reply);
  }

  try {
    command.execute(message, commandArgs);
  } catch (error) {
    console.error(error);
    message.reply('There was an error trying to execute that command!');
  }
});

client.login(process.env.TEST_TOKEN);