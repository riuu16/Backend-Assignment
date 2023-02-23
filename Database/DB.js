const mongoose = require("mongoose");
require("dotenv").config();

const bsURL = process.env.BASE_URL;
console.log(bsURL);
const connetionParams = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose
  .connect(bsURL, connetionParams)
  .then(() => {
    console.info(`connection DB`);
  })
  .catch((e) => {
    console.log(`Error:`, e.message);
  });
