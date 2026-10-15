import express from "express";

import {
  createProduct,
  getAllProducts,
  getProductById,
  deleteProduct,
} from "../controllers/product.controller.js";

const router = express.Router();

router.post("/", createProduct);

router.get("/", getAllProducts);

router.get("/:id", getProductById);

router.delete("/:id", deleteProduct);

export default router;
