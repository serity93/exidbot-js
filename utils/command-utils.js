const { roles: serverRoles } = require('./server-constants');

module.exports = {
  messageHasCorrectNumArgs: (args, minNumArgs, maxNumArgs) => {
    return args.length >= minNumArgs && (maxNumArgs === null || args.length <= maxNumArgs);
  },
  serverHasRequiredRole: (guild, requiredRole) => {
    return guild.roles.cache.some((role) => role.name === requiredRole.name);
  },
  memberHasRequiredRole: (member, requiredRole) => {
    return member.roles.cache.some((role) => role.name === requiredRole.name);
  },
  memberIsBlacklisted: (member) => {
    return member.roles.cache.some((role) => role.name === serverRoles.blacklist.name);
  },
};