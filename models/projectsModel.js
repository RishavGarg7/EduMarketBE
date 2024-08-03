import mongoose, { Schema } from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "Users" },
    projectTitle: { type: String, required: [true, "Job Title is required"] },
    jobType: { type: String, required: [true, "Job Type is required"] },
    techMat: [{ type: String, required: [true, "Tech Stuff is required"] }],
    tags: [{ type: String, required: [true, "Tags or Keywords is required"] }],
    sellingAmount: {
      type: Number,
      required: [true, "Selling Amount is required"],
    },
    desc: { type: String, required: [true, "Description is required"] },
    img: { type: String, required: [true, "Thumbnail is required"] },
    file: { type: String, required: [true, "Project files are required"] },
  },
  { timestamps: true }
);

const Projects = mongoose.model("Projects", projectSchema);

export default Projects;
