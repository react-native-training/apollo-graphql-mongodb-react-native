var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

module.exports = function() {

    var schema = Schema({
        name: {
            type: String
        }
    });

    return mongoose.model('TestModel', schema);
};
