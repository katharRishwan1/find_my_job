const { mongoose } = require("../services/imports");

module.exports = mongoose.model(
    'shop',
    new mongoose.Schema(
        {
            owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
            shopName: { type: String, uppercase: true },
            shopType: { type: mongoose.Schema.Types.ObjectId, ref: 'shop_type' },
            jobType: [{ type: mongoose.Schema.Types.ObjectId, ref: 'job_type' }],
            address: {
                pincode: String,
                address: String,
                areaName: String,
                district: String,
                state: String,
                pincodeId: { type: mongoose.Schema.Types.ObjectId, ref: 'pincode' },
            },
            gst: Boolean,
            gstNo: String,
            license: String,
            contactNo: String,
            alternativeNo: String,
            timing: {
                from: String,
                to: String
            },
            socialMediaLinks: [String],
            status: { type: String, enum: ['active', 'inactive'], default: 'active' },
            approveStatus: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
            createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
            isDeleted: { type: Boolean, default: false },
        },
        { timestamps: true, versionKey: false }
    ),
    'shop'
);