const { mongoose } = require("../services/imports");

module.exports = mongoose.model(
    'job_seeker',
    new mongoose.Schema(
        {




            createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
            isDeleted: { type: Boolean, default: false },
        },
        { timestamps: true, versionKey: false }
    ),
    'job_seeker'
);