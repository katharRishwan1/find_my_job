const { mongoose } = require("../services/imports");

module.exports = mongoose.model(
    'user',
    new mongoose.Schema({
        firstName: { type: String, trim: true },
        lastName: { type: String, trim: true },
        email: { type: String, trim: true, lowercase: true },
        mobile: { type: String, trim: true },
        img_url: String,
        role: { type: mongoose.Schema.Types.ObjectId, ref: 'role' },
        password: String,
        verified: {
            type: Boolean,
            default: false,
        },
        // mobileVerified: {
        //     type: Boolean,
        //     default: false,
        // },
        // emailVerified: {
        //     type: Boolean,
        //     default: false,
        // },
        coverImage: String,
        createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        lastLogin: { type: Date, default: Date.now },
        alternateMobile: { type: Number, trim: true },
        alternateEmail: { type: String, trim: true, lowercase: true },
        resetPasswordToken: String,
        resetPasswordTokenExpire: Date,
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        isDeleted: { type: Boolean, default: false },
    }, { timestamps: true, versionKey: false }),
    'user'
);