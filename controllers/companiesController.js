import mongoose from "mongoose";
import Companies from "../models/companiesModel.js";
import { response } from "express";
import Jobs from "../models/jobsModel.js";
import Users from "../models/userModel.js";

export const register = async (req, res, next) => {
  const { firstName, lastName, email, password } = req.body;

  //validate fields
  if (!firstName) {
    next("First Name is required!");
    return;
  }
  if (!lastName) {
    next("Last Name is required!");
    return;
  }
  if (!email) {
    next("Email address is required!");
    return;
  }
  if (!password) {
    next("Password is required and must be greater than 6 characters");
    return;
  }

  try {
    const accountExist = await Companies.findOne({ email });

    if (accountExist) {
      next("Email Already Registered. Please Login");
      return;
    }

    // create a new account
    const company = await Companies.create({
      firstName,
      lastName,
      email,
      password,
    });

    // user token
    const token = company.createJWT();

    res.status(201).json({
      success: true,
      message: "Company Account Created Successfully",
      user: {
        _id: company._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: company.email,
      },
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const signIn = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    //validation
    if (!email || !password) {
      next("Please Provide User Credentials");
      return;
    }

    const company = await Companies.findOne({ email }).select("+password");

    if (!company) {
      next("Invalid email or Password");
      return;
    }

    //compare password
    const isMatch = await company.comparePassword(password);
    if (!isMatch) {
      next("Invalid email or Password");
      return;
    }
    company.password = undefined;

    const token = company.createJWT();

    res.status(200).json({
      success: true,
      message: "Login SUccessfully",
      user: company,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const updateCompanyProfile = async (req, res, next) => {
  const { firstName, lastName, contact, profileUrl, about } =
    req.body;

  try {
    // validation
    if (!firstName || !lastName || !about || !contact || !profileUrl) {
      next("Please Provide All Required Fields");
      return;
    }

    const id = req.body.user.userId;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(404).send(`No Company with id: ${id}`);

    const updateCompany = {
      firstName,
      lastName,
      contact,
      profileUrl,
      about,
      _id: id,
    };

    const company = await Companies.findByIdAndUpdate(id, updateCompany, {
      new: true,
    });

    const token = company.createJWT();

    company.password = undefined;

    res.status(200).json({
      success: true,
      message: "Company Profile Updated SUccessfully",
      company,
      token,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getCompanyProfile = async (req, res, next) => {
  try {
    const id = req.body.user.userId;

    const company = await Companies.findById({ _id: id });

    if (!company) {
      return res.status(200).send({
        message: "Company Not Found",
        success: false,
      });
    }

    company.password = undefined;
    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getCompanies = async (req, res, next) => {
  try {
    const { search, sort } = req.query;

    //conditons for searching filters
    const queryObject = {};

    if (search) {
      queryObject.email = { $regex: search, $options: "i" };
    }

    let queryResult = Companies.find(queryObject).select("-password");

    // SORTING
    if (sort === "Newest") {
      queryResult = queryResult.sort("-createdAt");
    }
    if (sort === "Oldest") {
      queryResult = queryResult.sort("createdAt");
    }
    if (sort === "A-Z") {
      queryResult = queryResult.sort("email");
    }
    if (sort === "Z-A") {
      queryResult = queryResult.sort("-email");
    }

    // PAGINATIONS
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;

    const skip = (page - 1) * limit;

    // records count
    const total = await Companies.countDocuments(queryResult);
    const numOfPage = Math.ceil(total / limit);
    // move next page
    // queryResult = queryResult.skip(skip).limit(limit);

    // show mopre instead of moving to next page
    queryResult = queryResult.limit(limit * page);

    const companies = await queryResult;

    res.status(200).json({
      success: true,
      total,
      data: companies,
      page,
      numOfPage,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getCompanyJobListing = async (req, res, next) => {
  const { search, sort } = req.query;
  const id = req.body.user.userId;

  try {
    //conditons for searching filters
    const queryObject = {};

    if (search) {
      queryObject.location = { $regex: search, $options: "i" };
    }

    let sorting;
    //sorting || another way
    if (sort === "Newest") {
      sorting = "-createdAt";
    }
    if (sort === "Oldest") {
      sorting = "createdAt";
    }
    if (sort === "A-Z") {
      sorting = "firstName";
    }
    if (sort === "Z-A") {
      sorting = "-firstName";
    }

    let queryResult = await Companies.findById({ _id: id }).populate({
      path: "jobPosts",
      options: { sort: sorting },
    });
    const companies = await queryResult;

    res.status(200).json({
      success: true,
      companies,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const getCompanyById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const company = await Companies.findById({ _id: id }).populate({
      path: "jobPosts",
      options: {
        sort: "-_id",
      },
    });

    if (!company) {
      return res.status(200).send({
        message: "Company Not Found",
        success: false,
      });
    }

    company.password = undefined;

    res.status(200).json({
      success: true,
      data: company,
    });
  } catch (error) {
    console.log(error);
    res.status(404).json({ message: error.message });
  }
};

export const viewApplications = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.body.user.userId;

    const user = await Companies.findById({ _id: user_id });

    if (!user) {
      return res.status(200).send({
        message: "Company Not Found",
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

    const users = [];

    for (const applicant of job.application) {
      const user = await Users.findById(applicant);
      user.password = undefined;
      users.push(user);
    }

    res.status(200).json({
      message: "Applicants for Job Position",
      applications: users,
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
};
