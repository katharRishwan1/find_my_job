const { mongoose } = require("../services/imports");

module.exports = mongoose.model(
    'role',
    new mongoose.Schema({
        name: String,
        description: String,
        img_url: String,
        isDeleted: { type: Boolean, default: false },
    }, { timestamps: true, versionKey: false }),
    'role'
);