import TelegramBot from 'node-telegram-bot-api';
import config from './config'
import * as commandsHelper from './utils/commands';
import Translate from './commands/Translate';

const bot = new TelegramBot(config.apiKey, {
  polling: {
    timeout: config.pollingTimeout
  }
});

bot.getMe().then(me => {
  bot.info = me;
  console.log(`
-----------------------------
@${me.username} started!
${me.first_name}
#${me.id}
-----------------------------
`);
}).catch(err => {
  console.error(err);
})

bot.on('message', msg => {
  handleCommands(bot, msg);
});

function getParams(command, single = false) {

  // Return a single string
  if (single) {
    return command.split(' ').splice(1).join(' ');
  }

  return command.split(' ').splice(1);
}

function getCommand(command) {
  if (bot.info) {
    return command.replace(`@${bot.info.username}`, '').split(' ').shift().substr(1);
  } else {
    return command.split(' ').shift().substr(1);
  }
}

function handleCommands(bot, msg) {

  // It's not a comma nd
  if (!msg.text || !msg.text.indexOf('/') === 0) {
    return false;
  }

  let rawCommand = msg.text;


  // Get command name
  let command = getCommand(rawCommand);

  // If the command is invalid
  if (!commandsHelper.getCommands(command)) {
    //It's in a group (fix multiple bots problem)
    if (msg.chat.id > 0) {
      bot.sendMessage(msg.chat.id, `Command ${command} not found!
Use /help command to get help about.`);
    }
    return false;
  }

  let params = getParams(rawCommand, true);
  command && Translate[command]({user: msg.from, bot: bot, userId: msg.chat.id, params: params}).then(response => {
    bot.sendMessage(msg.chat.id, response);
  });

}
