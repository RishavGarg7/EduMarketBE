import express from "express";

// import authRoute from "./authRoute.js";
// import userRoute from "./userRoute.js"
import userRoute from "./userRoute.js"
import projectRoute from "./projectRoute.js"
import paymentRoute from './paymentRoute.js'

const router = express.Router();

const path = "/api-v1/";

// router.use(`${path}auth`, authRoute);
// router.use(`${path}user`, userRoute); //api-v1/auth/
router.use(`${path}user`,userRoute);
router.use(`${path}project`,projectRoute);
router.use(`${path}payment`,paymentRoute);

export default router;