const paypal = require("paypal-rest-sdk");

if (process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_SECRET_ID) {
  paypal.configure({
    mode: "sandbox",
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_SECRET_ID,
  });
}


module.exports = paypal;
