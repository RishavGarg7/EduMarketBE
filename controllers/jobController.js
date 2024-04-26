import mongoose from "mongoose";
import Jobs from "../models/jobsModel.js";
import Companies from "../models/companiesModel.js";
import Users from "../models/userModel.js";

export const createJob = async (req, res, next) => {
  try {
    const {
      projectTitle,
      jobType,
      techMat,
      tags,
      sellingAmount,
      desc,
      img
    } = req.body;

    if (
      !projectTitle ||
      !jobType ||
      !techMat ||
      !tags ||
      !sellingAmount ||
      !img ||
      !desc
    ) {
      next("Please Provide All Required Fields");
      return;
    }

    const id = req.body.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No Company with id: ${id}`);

    const jobPost = {
      projectTitle,
      jobType,
      techMat: techMat.split(","),
      tags: tags.split(","),
      sellingAmount,
      desc,
      img,
      company: id,
    };

    const job = new Jobs(jobPost);
    await job.save();

    //update the company information with job id
    const company = await Companies.findById(id);

    company.jobPosts.push(job._id);
    const updateCompany = await Companies.findByIdAndUpdate(id, company, {
      new: true,
    });

    res.status(200).json({
      success: true,
      message: "Job Posted Successfully",
      job,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};


export const updateJob = async (req, res, next) => {
  try {
    const {
      projectTitle,
      jobType,
      techMat,
      tags,
      sellingAmount,
      desc,
      img
    } = req.body;
    const { jobId } = req.params;

    if (
      !projectTitle ||
      !jobType ||
      !techMat ||
      !tags ||
      !sellingAmount ||
      !img ||
      !desc
    ) {
      next("Please Provide All Required Fields");
      return;
    }
    const id = req.body.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No Company with id: ${id}`);

    const jobPost = {
      projectTitle,
      jobType,
      techMat: techMat.split(","),
      tags: tags.split(","),
      sellingAmount,
      desc,
      img,
      company: id,
    };

    await Jobs.findByIdAndUpdate(jobId, jobPost, { new: true });

    res.status(200).json({
      success: true,
      message: "Job Post Updated Successfully",
      jobPost,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getJobPosts = async (req, res, next) => {
  try {
    const { search, sort, exp } = req.query;
    const sellingAmount = exp?.split("-");

    let queryObject = {};

    if (exp) {
      queryObject.sellingAmount = {
        $gte: Number(sellingAmount[0]) - 1,
        $lte: Number(sellingAmount[1]) + 1,
      };
    }

    if (search) {
      const searchQuery = {
        $or: [
          { projectTitle: { $regex: search, $options: "i" } },
          { tags: { $regex: search, $options: "i" } },
          { desc: { $regex: search, $options: "i" } },
          { techMat: { $regex: search, $options: "i" } },
        ],
      };
      queryObject = { ...queryObject, ...searchQuery };
    }

    let queryResult = Jobs.find(queryObject).populate({
      path: "company",
      select: "-password",
    });

    // SORTING
    if (sort === "Newest") {
      queryResult = queryResult.sort("-createdAt");
    }
    if (sort === "Oldest") {
      queryResult = queryResult.sort("createdAt");
    }
    if (sort === "A-Z") {
      queryResult = queryResult.sort("projectTitle");
    }
    if (sort === "Z-A") {
      queryResult = queryResult.sort("-projectTitle");
    }

    // pagination
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    //records count
    const totalJobs = await Jobs.countDocuments(queryResult);
    const numOfPage = Math.ceil(totalJobs / limit);

    queryResult = queryResult.limit(limit * page);

    const jobs = await queryResult;

    res.status(200).json({
      success: true,
      totalJobs,
      data: jobs,
      page,
      numOfPage,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getJobById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const job = await Jobs.findById({ _id: id }).populate({
      path: "company",
      select: "-password",
    });

    if (!job) {
      return res.status(200).send({
        message: "Job Post Not Found",
        success: false,
      });
    }

    //GET SIMILAR JOB POST
    const searchQuery = {
      $or: [
        { projectTitle: { $regex: search, $options: "i" } },
        { tags: { $regex: search, $options: "i" } },
        { desc: { $regex: search, $options: "i" } },
        { techMat: { $regex: search, $options: "i" } },
      ],
    };

    let queryResult = Jobs.find(searchQuery)
      .populate({
        path: "company",
        select: "-password",
      })
      .sort({ _id: -1 });

    queryResult = queryResult.limit(6);
    const similarJobs = await queryResult;

    res.status(200).json({
      success: true,
      data: job,
      similarJobs,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const deleteJobPost = async (req, res, next) => {
  try {
    const { id } = req.params;

    await Jobs.findByIdAndDelete(id);

    res.status(200).send({
      success: true,
      message: "Job Post Delted Successfully.",
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const applyForJob = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.body.user.userId;

    const user = await Users.findById({ _id: user_id });

    if (!user) {
      return res.status(200).send({
        message: "User Not Found",
        success: false,
      });
    }

    const job = await Jobs.findById({ _id: id });

    if (!job) {
      return res.status(500).send({
        message: "Job Not Found",
        success: false,
      });
    }

    if (job.application.includes(user_id)) {
      return res.status(500).send({
        message: "User already applied for this job",
        success: false,
      });
    }

    job.application.push(user_id);

    await job.save();

    res.status(200).json({
      message: "Application successful",
      success: true,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: "error",
      success: false,
      error: error.message,
    });
  }
}


export const checkifApplied = async (req, res, next) => {
  try {
    const { id } = req.params
    const user_id = req.body.user.userId;

    const user = await Users.findById({ _id: user_id });

    const job = await Jobs.findById({ _id: id });

    if (job.application.includes(user_id)) {
      return res.status(200).send({
        applicationstatus: true,
        success: true,
      });
    }
    else {
      return res.status(200).send({
        applicationstatus: false,
        success: true,
      });
    }
  } catch (error) {
    console.log(error)
  }
}

export const applicantdetails = async (req, res, next) => {
  try {
    const { id } = req.params
    const job = await Jobs.findById(id);
    const applicants = job.application
    return res.status(200).send({
      applicants: applicants,
      success: true
    })
  } catch (error) {
    console.log(error);
  }
}

