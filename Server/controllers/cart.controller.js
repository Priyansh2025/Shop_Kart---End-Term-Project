import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";

const productFields = "name description price category image stock createdAt";

async function getPopulatedCart(customerId) {
  const customer = await Customer.findById(customerId).populate({
    path: "cart.product",
    select: productFields,
  });
  if (!customer) return null;
  return customer.cart
    .filter((item) => item.product)
    .map((item) => ({ product: item.product, quantity: item.quantity }));
}

function sendError(res, status, message) {
  return res.status(status).json({ success: false, message });
}

export const getCart = async (req, res) => {
  try {
    const cart = await getPopulatedCart(req.user.id);
    if (!cart) return sendError(res, 404, "Customer not found");
    return res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("GET CART ERROR:", error);
    return sendError(res, 500, "Unable to load cart");
  }
};

export const addToCart = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return sendError(res, 400, "Invalid product ID");
    }

    const product = await Product.findById(productId);
    if (!product) return sendError(res, 404, "Product not found");
    if (product.stock < 1) return sendError(res, 400, "Product is out of stock");

    const customer = await Customer.findById(req.user.id);
    if (!customer) return sendError(res, 404, "Customer not found");

    const item = customer.cart.find((entry) => entry.product.toString() === productId);
    const nextQuantity = item ? item.quantity + 1 : 1;
    if (nextQuantity > product.stock) {
      return sendError(res, 400, `Only ${product.stock} unit(s) are available`);
    }

    if (item) item.quantity = nextQuantity;
    else customer.cart.push({ product: product._id, quantity: 1 });

    await customer.save();
    const cart = await getPopulatedCart(req.user.id);
    return res.status(200).json({ success: true, message: "Cart updated", cart });
  } catch (error) {
    console.error("ADD TO CART ERROR:", error);
    return sendError(res, 500, "Unable to add product to cart");
  }
};

export const updateCartQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const quantity = req.body?.quantity;

    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return sendError(res, 400, "Invalid product ID");
    }
    if (!Number.isInteger(quantity) || quantity < 1) {
      return sendError(res, 400, "Quantity must be an integer of at least 1");
    }

    const product = await Product.findById(productId);
    if (!product) return sendError(res, 404, "Product not found");
    if (quantity > product.stock) {
      return sendError(res, 400, `Only ${product.stock} unit(s) are available`);
    }

    const customer = await Customer.findById(req.user.id);
    if (!customer) return sendError(res, 404, "Customer not found");
    const item = customer.cart.find((entry) => entry.product.toString() === productId);
    if (!item) return sendError(res, 404, "Product is not in your cart");

    item.quantity = quantity;
    await customer.save();
    const cart = await getPopulatedCart(req.user.id);
    return res.status(200).json({ success: true, message: "Quantity updated", cart });
  } catch (error) {
    console.error("UPDATE CART ERROR:", error);
    return sendError(res, 500, "Unable to update quantity");
  }
};

export const removeFromCart = async (req, res) => {
  try {
    const { productId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      return sendError(res, 400, "Invalid product ID");
    }

    const customer = await Customer.findById(req.user.id);
    if (!customer) return sendError(res, 404, "Customer not found");
    const index = customer.cart.findIndex((entry) => entry.product.toString() === productId);
    if (index === -1) return sendError(res, 404, "Product is not in your cart");

    customer.cart.splice(index, 1);
    await customer.save();
    const cart = await getPopulatedCart(req.user.id);
    return res.status(200).json({ success: true, message: "Product removed", cart });
  } catch (error) {
    console.error("REMOVE FROM CART ERROR:", error);
    return sendError(res, 500, "Unable to remove product");
  }
};
