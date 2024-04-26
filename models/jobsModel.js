import mongoose, { Schema } from "mongoose";

const jobSchema = new mongoose.Schema({
    company:{type:Schema.Types.ObjectId,ref:"Companies"},
    projectTitle:{type:String, required:[true,"Job Title is required"]},
    jobType:{type:String,required:[true,"Job Type is required"]},
    techMat:[{type:String,required:[true,"Tech Stuff is required"]}],
    tags:[{type:String,required:[true,"Tags or Keywords is required"]}],
    sellingAmount: {type:Number, required: [true,"Selling Amount is required"]},
    desc:{type:String,required:[true,"Description is required"]},
    img:{type:String},
    application:[{ type:Schema.Types.ObjectId,ref:"Users"}]
},
{timestamps:true});

const Jobs = mongoose.model("Jobs",jobSchema);

export default Jobs;