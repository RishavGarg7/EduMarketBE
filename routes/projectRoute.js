import express from "express";
import userAuth from "../middlewares/authMiddleware.js";
import {
  createProject,
  deleteProjectPost,
  getProjectById,
  getProjectPosts,
  updateProject,
} from "../controllers/projectController.js";

const router = express.Router();

// POST JOB
router.post("/upload-project", userAuth, createProject);

// UPDATE JOB
router.put("/update-project/:projectId", userAuth, updateProject);

// GET JOB POST
router.get("/find-projects", getProjectPosts);
router.get("/get-project-detail/:id", getProjectById);

// DELETE JOB POST
router.delete("/delete-project/:id", userAuth, deleteProjectPost);

//USER APPLIES FOR JOB
// router.put("/get-job-detail/:id",userAuth,applyForJob)

// router.get("/has-user-applied/:id",userAuth,checkifApplied)

// router.get("/applicantdetails",userAuth,applicantdetails)

export default router;
