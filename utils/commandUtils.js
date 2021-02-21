module.exports = {
  messageHasCorrectNumArgs: (command, args) => {
    if (!command.numArgs) 
      return true;

    if (typeof command.numArgs === 'number') 
      return args.length === command.numArgs

    if (Array.isArray(command.numArgs)) 
      return args.length >= command.numArgs[0] && args.length <= command.numArgs[1];
  },
  memberHasRequiredRole: (command, member) => {
    if (!command.roles)
      return true;

    for (const commandRole of command.roles) {
      if (member.roles.cache.some((role) => role.name === commandRole)){
        return true;
      }
    }

    return false;
  },
  memberIsBlacklisted: (member) => {
    return member.roles.cache.some((role) => role.name === 'Blacklist');
  },
};