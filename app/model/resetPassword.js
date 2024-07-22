const mongoose = require('mongoose')

module.exports = mongoose.model(
    'reset_password',
    new mongoose.Schema(
        {
            user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
            email: String,
            mobile: String,
            verification_id: { type: String, default: null },
            otp: { type: String, default: null },
            expiresOn: Date,
            isVerified: { type: Boolean, default: false },
        },
        { timestamps: true, versionKey: false },
    ),
    'reset_password',
)
