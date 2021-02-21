module.exports = {
  hasCorrectNumArgs: (command, args) => {
    if (!command.numArgs) 
      return true;

    if (typeof command.numArgs === 'number') 
      return args.length === command.numArgs

    if (Array.isArray(command.numArgs)) 
      return args.length >= command.numArgs[0] && args.length <= command.numArgs[1];
  },
};