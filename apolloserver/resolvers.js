const { President } = require('./connectors');

const resolveFunctions = {
  RootQuery: {
    president(_, { name }) {
      const president = new President();
      return president.findPresident(name);
    },
  },
};

module.exports = resolveFunctions;
