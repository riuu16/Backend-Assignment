const mongoose = require("mongoose");

const paymentSchema = mongoose.Schema(
  {
    plan: {
      type: String,
    },
    amount: {
      type: String,
    },
    email: {
      type: String,
    },
    customer_id: {
      type: String,
    },
    payment_id: {
      type: String,
    },
    status: {
      type: String,
    },
  },
  { timestamps: true }
);

const Payment = mongoose.model("payment", paymentSchema);

module.exports = Payment;
