var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var IssueSchema = new Schema({
    deptCode: String,
    roomName: String,
    type: String,
    description: String,
    reportingDate: String,
    reporter: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reporterMail: String
});

module.exports = mongoose.model('Issue', IssueSchema);