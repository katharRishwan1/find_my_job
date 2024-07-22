const db = {};

db.user = require('./user');
db.role = require('./role');
db.otp = require('./otp');
db.resetPassword = require('./resetPassword');
module.exports = db;