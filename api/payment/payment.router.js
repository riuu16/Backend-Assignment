const {
  userPayment,
  payement,
  UpdatePaymentStatus,
} = require("./payment.controller");

const router = require("express").Router();

// router.post('/', userPayment)
router.post("/", payement);
router.post("/update/", UpdatePaymentStatus);

module.exports = router;
