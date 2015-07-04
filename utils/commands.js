const commands = [
  {
    command: 'tl',
    params: ['text'],
    usage: `Translate text
Example: /tl mother`
  },
  {
    command: 'src',
    params: ['source language'],
    usage: `Set source language
Example: /src en`
  },
  {
    command: 'dest',
    params: ['destination language'],
    usage: `Set destination language
Example: /dest fr`
  },
  {
    command: 'swp',
    params: [],
    usage: `Swap source and destination languages
Example /swp`
  },
  {
    command: 'help',
    params: ['command name (optional)'],
    usage: 'Get help about all or specified command'
  }
];

function buildHelp(command) {
  return `/${command.command} ${command.params.length ? '[ ' + command.params.join(' ') + ' ]' : ''} - ${command.usage}
`;
}

function helpAll() {
  let listMessage = `Commands:
`;
  commands.forEach(cmd => {
    listMessage += '----------\n' + buildHelp(cmd);
  });
  return listMessage;
}

export function help(command) {
  if (!command) {
    return helpAll();
  }

  let help = '';
  for (var i = 0, max = commands.length; i < max; i++) {
    if (commands[i].command === command) {
      help = buildHelp(commands[i]);
      break;
    }
  }

  if (help) {
    return help;
  }

  return `We don't have any /${command} command.`;
}

export function getCommands(command = undefined) {
  if (!command) {
    return commands;
  }

  return commands.find(cmd => {
    return command === 'start' || cmd.command === command
  });

  return false;
}
