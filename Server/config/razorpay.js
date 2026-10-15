import Razorpay from "razorpay";

let client;
export function getRazorpay() {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay test keys are missing. Configure RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in Server/.env.");
  }
  if (!client) client = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
  return client;
}
