import express from "express";
import {
  getUsers,
  getUserById,
  getUserProjectListing,
  getUserProfile,
  register,
  signIn,
  updateUserProfile,
} from "../controllers/userController.js";
import userAuth from "../middlewares/authMiddleware.js";
const router = express.Router();

router.post("/register", register);
router.post("/login", signIn);

router.post("/get-user-profile", userAuth, getUserProfile);
router.post("/get-user-projectlisting", userAuth, getUserProjectListing);
router.get("/", getUsers);
router.get("/get-user/:id", getUserById);

router.put("/update-user", userAuth, updateUserProfile);

// router.get('/jobs/:id',userAuth,viewApplications);

export default router;
