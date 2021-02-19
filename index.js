const Discord = require('discord.js');
const dotenv = require('dotenv');

/*
A Discord bot written specifically for the EXID Discord server.

Bot owner & main contributor:
  Sean Tyler (sean#0419) (https://github.com/serity93/exidbot-js)
*/

dotenv.config();

const client = new Discord.Client();

client.once('ready', () => {
  console.log('Ready!');
});

client.login(process.env.TEST_TOKEN);