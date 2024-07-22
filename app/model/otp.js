const { mongoose } = require('../services/imports');

const MobileOtpSchema = mongoose.Schema({
    user_id: String,
    code: String,
    mobile: String,
    type: String,
    count: Number,
    //   expire_at: { type: Date, default: Date.now, expires: '1m' },
});

module.exports = mongoose.model('mobile_otp_users', MobileOtpSchema);
