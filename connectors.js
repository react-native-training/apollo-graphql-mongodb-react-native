const Mongoose = require('mongoose');
const rp = require('request-promise');

Mongoose.connect('mongodb://localhost/views', (err) => {
  if (err) {
    return err;
  }
  return true;
});

const ViewSchema = Mongoose.Schema({
  postId: Number,
  views: Number,
});

const PersonSchema = Mongoose.Schema({
  firstName: String,
  lastName: String,
});

const View = Mongoose.model('views', ViewSchema);
const PersonForSearch = Mongoose.model('people', PersonSchema, 'people');

// class FortuneCookie {
//   constructor() {
//     this.getOne = () => {
//       return rp('http://fortunecookieapi.com/v1/cookie')
//         .then(res => JSON.parse(res))
//         .then((res) => {
//           return res[0].fortune.message;
//         });
//     };
//   }
// }

class MongoViews {
  constructor() {
    this.findView = () => {
      return View.find();
    };
  }
}

class Person {
  constructor() {
    this.findPerson = (name) => {
      const person = PersonForSearch.findOne({ firstName: name }, (error, data) => {
        return data;
      });
      return person;
    };
  }
}

module.exports = { Person, MongoViews };
