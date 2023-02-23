const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
    },
    password: {
      type: String,
    },
    pin:{
        type: String,
      },
    reason: {
      type: String,
    },
    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "payment",
    },
    userDetails: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "userDetail",
    },
    user_exist: {
      type: Boolean,
    },
  },
  { timestamps: true }
);

const userDetailsSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
    },
    location: {
      type: String,
    },
    DOB: {
      type: String,
    },
    Gender: {
      type: String,
    },
    bio: {
      type: String,
    },
    links: {
      linkedln: {
        type: String,
      },
      facebook: {
        type: String,
      },
    },
    media: {
      image: {
        type: String,
      },
      video: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

const User = new mongoose.model("user", userSchema);
const UserDetails = new mongoose.model("userDetail", userDetailsSchema);

module.exports = {
  User,
  UserDetails,
};
