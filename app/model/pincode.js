const mongoose = require('mongoose')

module.exports = mongoose.model(
    'pincode',
    new mongoose.Schema(
        {
            pincode: String,
            stateName: String,
            district: String,
            officeName: String,
            divisionName: String,
            latitude: String,
            longitude: String,
        },
        { timestamps: true, versionKey: false },
    ),
    'pincode',
)
