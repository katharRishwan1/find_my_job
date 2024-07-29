const { mongoose } = require("../services/imports");

module.exports = mongoose.model(
    'shop',
    new mongoose.Schema(
        {
            owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
            shopName: { type: String, uppercase: true },
            shopType: { type: mongoose.Schema.Types.ObjectId, ref: 'shop_type' },
            address: {
                pincode: String,
                address: String,
                areaName: String,
                district: String,
                state: String,
                pincodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'pincode' },
            },
            gstNo: String,
            license: String,
            jobType: [{ type: mongoose.Schema.Types.ObjectId, ref: 'job_type' }],
            status: { type: String, enum: ['active', 'inactive'], default: 'active' },
            // available timing
            // startDate
            approveStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
            isDeleted: { type: Boolean, default: false },
        },
        { timestamps: true, versionKey: false }
    ),
    'shop'
);