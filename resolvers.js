const { Person, MongoViews, FortuneCookie } = require('./connectors');

const resolveFunctions = {
  RootQuery: {
    fortuneCookie() {
      const cookie = new FortuneCookie();
      return cookie.getOne();
    },
    views() {
      const view = new MongoViews();
      return view.findView();
    },
    people(_, { firstName }) {
      console.log('firstName::', firstName);
      const person = new Person();
      return person.findPerson(firstName);
    },
  },
};

module.exports = resolveFunctions;
