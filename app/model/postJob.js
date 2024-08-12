const { mongoose } = require("../services/imports");

module.exports = mongoose.model(
    'post_job',
    new mongoose.Schema({
        shop: { type: mongoose.Schema.Types.ObjectId, ref: 'shop' }, // get location
        jobType: { type: mongoose.Schema.Types.ObjectId, ref: 'job_type' },
        jobSummary: String,
        responsibilities: String,
        compesationAndBenefits: String,
        skills: [String],
        employementType: [{ type: String, enum: ['fulltime', 'parttime', 'temprorary', 'permanent'] }],
        pay: {
            from: String,
            to: String
        },
        schedule: String,
        qualifications: [String],
        contactInformation: String,
        deadline: String,
        owner: { type: mongoose.Schema.Types.ObjectId, ref: 'user' },
        isDeleted: { type: Boolean, default: false },
    },
        { timestamps: true, versionKey: false }),
    'post_job'
);