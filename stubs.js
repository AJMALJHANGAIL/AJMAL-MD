const { categories } = require('./menu');

module.exports = ({ cmd, PREFIX }) => {
  Object.values(categories).flat().forEach(name => {
    cmd({
      pattern: name,
      handler: async ({ reply }) => {
        reply(`✅ *${name}* — placeholder active. Use: ${PREFIX}${name}`);
      }
    });
  });
};
