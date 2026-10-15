import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";
import { createPaymentOrder, verifyPayment, getMyOrders, getOrderById, updateOrderStatusForDevelopment } from "../controllers/order.controller.js";

const router = express.Router();
router.use(authMiddleware);
router.post("/create-payment-order", createPaymentOrder);
router.post("/verify-payment", verifyPayment);
router.get("/", getMyOrders);
router.get("/:id", getOrderById);
router.patch("/:id/status", updateOrderStatusForDevelopment);
export default router;
