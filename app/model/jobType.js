const { mongoose } = require("../services/imports");

module.exports = mongoose.model(
    'job_type',
    new mongoose.Schema({
        shopType: { type: mongoose.Schema.Types.ObjectId, ref: 'shop_type' },
        name: { type: String, uppercase: true },
        description: String,
        img_url: String,
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        isDeleted: { type: Boolean, default: false },
    },
        { timestamps: true, versionKey: false }),
    'job_type'
);