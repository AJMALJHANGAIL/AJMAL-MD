
module.exports = ({ cmd, PREFIX }) => {
  cmd({ pattern: 'ping', handler: async ({ reply }) => reply('pong') });
};
