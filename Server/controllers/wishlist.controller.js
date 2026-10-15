import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

// Add a product to the currently authenticated customer's wishlist.
export const addToWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    // The customer ID comes from the verified JWT, never from the request body.
    const customer = await Customer.findById(req.user.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const alreadyInWishlist = customer.wishlist.some(
      (savedProductId) => savedProductId.toString() === productId,
    );

    if (alreadyInWishlist) {
      return res.status(409).json({
        success: false,
        message: "Product is already in your wishlist",
      });
    }

    customer.wishlist.push(product._id);
    await customer.save();

    return res.status(201).json({
      success: true,
      message: "Product added to wishlist",
      wishlist: customer.wishlist,
    });
  } catch (error) {
    console.error("ADD TO WISHLIST ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Return the authenticated customer's wishlist with complete product details.
export const getWishlist = async (req, res) => {
  try {
    const customer = await Customer.findById(req.user.id).populate({
      path: "wishlist",
      select: "name description price category image stock createdAt",
    });

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    // Filter null entries in case a referenced product was deleted separately.
    const wishlist = customer.wishlist.filter(Boolean);

    return res.status(200).json({
      success: true,
      count: wishlist.length,
      wishlist,
    });
  } catch (error) {
    console.error("GET WISHLIST ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// Remove a product from the authenticated customer's wishlist.
export const removeFromWishlist = async (req, res) => {
  try {
    const { productId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const customer = await Customer.findById(req.user.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "Customer not found",
      });
    }

    const wishlistIndex = customer.wishlist.findIndex(
      (savedProductId) => savedProductId.toString() === productId,
    );

    if (wishlistIndex === -1) {
      return res.status(404).json({
        success: false,
        message: "Product is not in your wishlist",
      });
    }

    customer.wishlist.splice(wishlistIndex, 1);
    await customer.save();

    return res.status(200).json({
      success: true,
      message: "Product removed from wishlist",
    });
  } catch (error) {
    console.error("REMOVE FROM WISHLIST ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
