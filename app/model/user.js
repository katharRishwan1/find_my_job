const { mongoose } = require("../services/imports");

module.exports = mongoose.model(
    'user',
    new mongoose.Schema({
        firstName: String,
        lastName: String,
        img_url: String,
        role:{ type:mongoose.Schema.Types.ObjectId,ref:'role'},
        password:String,
        email:String,
        mobile:String,
        status:{type:String,enum:['active','inactive'],default:'active'},
        isDeleted: { type: Boolean, default: false },
    }, { timestamps: true, versionKey: false }),
    'user'
);