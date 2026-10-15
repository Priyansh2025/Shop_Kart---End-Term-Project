import express from "express";

import {
  registerCustomer,
  loginCustomer,
  getMyProfile,
  logoutCustomer,
  getAllCustomers,
} from "../controllers/customer.controller.js";

import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/register", registerCustomer);

router.post("/login", loginCustomer);

router.get("/", getAllCustomers);

router.get("/me", authMiddleware, getMyProfile);

router.post("/logout", authMiddleware, logoutCustomer);

export default router;
