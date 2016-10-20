const PresidentModel = require('./model');

class President {
  constructor() {
    this.findPresident = (name) => {
      const person = PresidentModel.findOne({ name }, (error, data) => {
        return data;
      });
      return person;
    };
  }
}

module.exports = { President };
