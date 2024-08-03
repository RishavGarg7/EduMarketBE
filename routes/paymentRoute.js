import express from "express";
import {payProduct,successPage, cancelPage} from "../controllers/paymentController.js";
const router = express.Router();

router.post('/pay', payProduct);
router.get('/success', successPage);
router.get('/cancel', cancelPage);

export default router;