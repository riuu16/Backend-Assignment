const Payment = require("./payment.model");
const { User } = require("../users/users.model");
require("dotenv").config();
// add strip key

const Stripe = require("stripe");
const stripe = new Stripe(
  "sk_test_51McUjkSJdyoeeOqcDpEojCNpCnAH8SGYDZ9PhGi2WlQSJDgJDpzuXJt0sMk62pm9MHH9FqvAk2RlOa2T9iWLR5qf00ZILP01ol"
);

module.exports = {
  payement: async (req, res) => {
    const { product, user_id } = req.body;

    const paymentMethodId = req.body.paymentMethodId;
    console.log(`req.body`, user_id);

    const amount = Math.round(product.price * 100);
    const email = product.email;
    const plan = product.plan;
    // console.log(amount)

    try {
      const customer = await stripe.customers.create({
        email: email,
        name: email,
      });
      const myPayment = await stripe.paymentIntents.create({
        amount: amount,
        currency: "inr",
        payment_method: paymentMethodId,
        customer: customer.id,
        receipt_email: email,
        confirm: true,
      });

      // const Product = await stripe.products.create({
      //     name: `Product ${plan}`,
      //     default_price_data: {unit_amount: amount, currency: 'inr'},
      //     expand: ['default_price'],
      //   });

      //   const price = await stripe.prices.create({
      //     product: Product.id,
      //     unit_amount: amount,
      //     currency: 'inr',
      //   });

      // const customerId = customer.id
      // // Create an Invoice
      // const invoice = await stripe.invoices.create({
      //     customer: customerId,
      //     collection_method: 'send_invoice',
      //     days_until_due: 30,
      // });

      // const invoiceItem = await stripe.invoiceItems.create({
      //     customer: customerId,
      //     price: price.id,
      //     invoice: invoice.id
      // });
      // // Send the Invoice
      // const Invoices = await stripe.invoices.sendInvoice(invoice.id);

      // console.log(Invoices)
      console.log(myPayment);
      // const charge = await stripe.charges.create({
      //     customer: customerId,
      //     amount: amount,
      //     description: `product ${plan}`,
      //     currency: 'inr',
      //     receipt_email: email
      //   });

      const PaymentData = Payment({
        plan: plan,
        amount: product.price,
        email: customer.email,
        customer_id: customer.id,
        payment_id: myPayment.id,
        status: `in progress`,
      });

      const makePayment = await PaymentData.save();

      if (!makePayment) {
        return res.status(403).json({
          Error: [
            {
              message: `payment Unsuccessful`,
            },
          ],
        });
      } else {
        const Update_user_info = await User.findByIdAndUpdate(
          user_id,
          {
            $set: {
              payment: makePayment,
              plan: {
                name: plan,
                active: false,
              },
            },
          },
          { new: true }
        );

        if (Update_user_info) {
          return res.status(200).json({
            message: `payment in process`,
            client_secret: myPayment.client_secret,
            paymentId: makePayment,
            user: Update_user_info,
            // invoice : Invoices
          });
        }
      }

      // res.status(200).json({

      //     success: true,
      //     customer: customer,
      //     client_secret: myPayment.client_secret,
      //     // confirm : confirm,
      //     data: myPayment
      //     //here mypaypent has a client secret
      // });
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({
        Error: [
          {
            error: error.message,
            message: `Please contact adminator`,
          },
        ],
      });
    }
  },

  UpdatePaymentStatus: async (req, res) => {
    const { payment_id, user_id } = req.body;

    try {
      const Update_Payment_info = await Payment.findByIdAndUpdate(
        payment_id,
        {
          $set: {
            status: `succeeded`,
          },
        },
        { new: true }
      );

      const Update_user_info = await User.findByIdAndUpdate(
        user_id,
        {
          $set: {
            plan: {
              name: Update_Payment_info.plan,
              active: true,
            },
          },
        },
        { new: true }
      );

      const user_all_Details = await User.findOne({ _id: user_id })
        .populate("userDetails")
        .populate("payment");

      return res.status(200).json({
        message: `Payment Successfully Done`,
        payment_Details: Update_Payment_info,
        user: user_all_Details,
      });
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({
        Error: [
          {
            error: error.message,
            message: `Please contact adminator`,
          },
        ],
      });
    }
  },

  userPayment: async (req, res) => {
    const { paymentID, planName, validity, amount } = req.body;
    const { _id } = req.params;

    try {
      const data = Payment({
        payment_refNumber: paymentID,
        plam: planName,
        validity: validity,
        amount: amount,
        userId: _id,
      });

      const makePayment = await data.save();

      if (!makePayment) {
        return res.status(403).json({
          Error: [
            {
              message: `payment Unsuccessful`,
            },
          ],
        });
      } else {
        const update_user_info = await User.findByIdAndUpdate(
          _id,
          {
            $set: {
              payment: makePayment,
            },
          },
          { new: true }
        );

        if (update_user_info) {
          return res.status(200).json({
            message: `Payment Successful`,
          });
        }
      }
    } catch (error) {
      console.log(error.message);
      return res.status(400).json({
        Error: [
          {
            error: error.message,
            message: `Please contact adminator`,
          },
        ],
      });
    }
  },
};
