const Mongoose = require('mongoose');

const PresidentSchema = Mongoose.Schema({
  name: String,
  party: String,
  term: String,
});

const President = Mongoose.model('President', PresidentSchema);

module.exports = President;