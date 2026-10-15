import crypto from "crypto";
import mongoose from "mongoose";
import Customer from "../models/customer.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import { getRazorpay } from "../config/razorpay.js";

const fail = (res, status, message) => res.status(status).json({ success: false, message });
const clean = value => typeof value === "string" ? value.trim() : "";
function validateAddress(address) {
  const fields = ["fullName", "phone", "addressLine1", "city", "state", "pincode"];
  for (const field of fields) if (!clean(address?.[field])) return `${field} is required.`;
  if (!/^[6-9]\d{9}$/.test(clean(address.phone))) return "Enter a valid 10-digit Indian phone number.";
  if (!/^\d{6}$/.test(clean(address.pincode))) return "Pincode must contain 6 digits.";
  return "";
}

export const createPaymentOrder = async (req, res) => {
  let savedOrder;
  try {
    const addressError = validateAddress(req.body?.shippingAddress);
    if (addressError) return fail(res, 400, addressError);
    const customer = await Customer.findById(req.user.id);
    if (!customer) return fail(res, 404, "Customer not found.");
    if (!customer.cart?.length) return fail(res, 400, "Your cart is empty.");

    const items = [];
    let totalAmount = 0;
    for (const cartItem of customer.cart) {
      const product = await Product.findById(cartItem.product);
      if (!product) return fail(res, 400, "A product in your cart is no longer available. Remove it and try again.");
      if (!Number.isInteger(cartItem.quantity) || cartItem.quantity < 1 || cartItem.quantity > product.stock) {
        return fail(res, 400, `Insufficient stock for ${product.name}. Available: ${product.stock}.`);
      }
      items.push({ product: product._id, name: product.name, price: product.price, quantity: cartItem.quantity, image: product.image });
      totalAmount += product.price * cartItem.quantity;
    }
    totalAmount = Math.round((totalAmount + Number.EPSILON) * 100) / 100;
    if (!Number.isFinite(totalAmount) || totalAmount <= 0) return fail(res, 400, "Order total must be greater than zero.");

    savedOrder = await Order.create({
      user: customer._id,
      items,
      shippingAddress: Object.fromEntries(["fullName", "phone", "addressLine1", "city", "state", "pincode"].map(k => [k, clean(req.body.shippingAddress[k])])),
      totalAmount,
      paymentStatus: "PENDING",
      status: "PENDING_PAYMENT",
    });

    const razorpay = getRazorpay();
    const paymentOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), currency: "INR", receipt: savedOrder._id.toString(),
    });
    savedOrder.razorpayOrderId = paymentOrder.id;
    await savedOrder.save();
    return res.status(201).json({
      success: true,
      shopKartOrderId: savedOrder._id,
      razorpayOrderId: paymentOrder.id,
      amount: paymentOrder.amount,
      currency: paymentOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      order: savedOrder,
    });
  } catch (error) {
    console.error("CREATE PAYMENT ORDER ERROR:", error);
    if (savedOrder?._id) {
      // Keep the pending order for troubleshooting; the cart remains untouched.
      await Order.findByIdAndUpdate(savedOrder._id, { status: "PENDING_PAYMENT" }).catch(() => {});
    }
    return fail(res, 500, error.message?.includes("Razorpay test keys") ? error.message : "Unable to start checkout. Your cart has not been cleared.");
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { shopKartOrderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};
    if (!mongoose.Types.ObjectId.isValid(shopKartOrderId)) return fail(res, 400, "Invalid ShopKart order ID.");
    if (![razorpay_order_id, razorpay_payment_id, razorpay_signature].every(v => typeof v === "string" && v.trim())) return fail(res, 400, "Payment verification details are incomplete.");

    const order = await Order.findOne({ _id: shopKartOrderId, user: req.user.id });
    if (!order) return fail(res, 404, "Order not found.");
    if (order.paymentStatus === "PAID") return res.status(200).json({ success: true, message: "Payment already verified.", order });
    if (!order.razorpayOrderId || order.razorpayOrderId !== razorpay_order_id) return fail(res, 400, "Payment order does not match.");

    const expected = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${order.razorpayOrderId}|${razorpay_payment_id}`).digest();
    let received;
    try { received = Buffer.from(razorpay_signature, "hex"); } catch { received = Buffer.alloc(0); }
    if (received.length !== expected.length || !crypto.timingSafeEqual(expected, received)) {
      return fail(res, 400, "Invalid payment signature. Your cart has not been cleared.");
    }

    order.paymentStatus = "PAID";
    order.status = "PLACED";
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();
    const customer = await Customer.findById(req.user.id);
    if (customer) { customer.cart = []; await customer.save(); }
    return res.status(200).json({ success: true, message: "Payment verified and order placed.", order });
  } catch (error) {
    console.error("VERIFY PAYMENT ERROR:", error);
    return fail(res, 500, "Unable to verify payment. Please contact support before retrying.");
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).sort({ createdAt: -1 }).select("items totalAmount paymentStatus status createdAt shippingAddress");
    return res.status(200).json({ success: true, orders });
  } catch (error) { console.error("GET ORDERS ERROR:", error); return fail(res, 500, "Unable to load orders."); }
};

export const getOrderById = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return fail(res, 404, "Order not found.");
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return fail(res, 404, "Order not found.");
    return res.status(200).json({ success: true, order });
  } catch (error) { console.error("GET ORDER ERROR:", error); return fail(res, 500, "Unable to load order."); }
};

// Bonus: development-only order progression endpoint. Never enabled in production.
export const updateOrderStatusForDevelopment = async (req, res) => {
  if (process.env.NODE_ENV === "production") return fail(res, 404, "Not found.");
  try {
    const allowed = ["PLACED", "CONFIRMED", "SHIPPED", "DELIVERED"];
    if (!allowed.includes(req.body?.status)) return fail(res, 400, "Invalid order status.");
    const order = await Order.findOne({ _id: req.params.id, user: req.user.id });
    if (!order) return fail(res, 404, "Order not found.");
    if (order.paymentStatus !== "PAID") return fail(res, 400, "Only paid orders can progress.");
    const progression = { PLACED: 0, CONFIRMED: 1, SHIPPED: 2, DELIVERED: 3 };
    if (progression[req.body.status] < progression[order.status]) return fail(res, 400, "Order status cannot move backwards.");
    order.status = req.body.status;
    await order.save();
    return res.status(200).json({ success: true, order });
  } catch (error) { console.error("UPDATE ORDER STATUS ERROR:", error); return fail(res, 500, "Unable to update order status."); }
};
