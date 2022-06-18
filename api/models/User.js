var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var UserSchema = new Schema({
    email: {
        type: String,
        unique: true
    },
    loginId: {
        type: String,
        unique: true
    },
    su: Boolean,
    lastDept: String
});

module.exports = mongoose.model('User', UserSchema);