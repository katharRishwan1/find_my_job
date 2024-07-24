const { mongoose } = require("../services/imports");

module.exports = mongoose.model(
    'shop_type',
    new mongoose.Schema({
        name: String,
        description: String,
        img_url: String,
        status: { type: String, enum: ['active', 'inactive'], default: 'active' },
        isDeleted: { type: Boolean, default: false },
    }, { timestamps: true, versionKey: false }),
    'shop_type'
);