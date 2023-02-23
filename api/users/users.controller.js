require("../../Database/DB");
const { User, UserDetails } = require("./users.model");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
require("dotenv").config();

function generateOTP() {
  var digits = "0123456789";
  let OTP = "";
  for (let i = 0; i < 4; i++) {
    OTP += digits[Math.floor(Math.random() * 10)];
  }
  return OTP;
}

async function sendEmailOTP(email, otp) {
  //   const transporter = nodemailer.createTransport({
  //     service: "gmail",
  //     auth: {
  //       user: "riyadeepkaur16@gmail.com",
  //       pass: "baker@16",
  //     },
  //     tls: {
  //         // do not fail on invalid certs
  //         rejectUnauthorized: false
  //     },
  // //   });
  // const transporter = nodemailer.createTransport({
  //   host: "smtp.ethereal.email",
  //   port: 587,
  //   auth: {
  //     user: "",
  //     pass: "UmscqQKZ8KcwZYvV29",
  //   },
  //   tls: {
  //     // do not fail on invalid certs
  //     rejectUnauthorized: false,
  //   },
  // });

  const transporter = nodemailer.createTransport({
    host: "smtp.ethereal.email",
    port: 587,
    auth: {
      user: "arnold.marquardt@ethereal.email",
      pass: "spTjxvWBPV5A6qyJ9X",
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });

  let details = {
    from: "arnold.marquardt@ethereal.email",
    to: email,
    subject: "One Time Password",
    text: `OTP : ${otp}`,
  };

  transporter.sendMail(details, (err) => {
    if (err) {
      console.log("it has an err", err);
    } else {
      console.log("email send");
      return `Email send`;
    }
  });
}

module.exports = {
  userRegistration: async (req, res) => {
    const { fullname, email, dob, location, password } = req.body;

    let isExist = await User.findOne({ email: email });

    if (isExist) {
      return res.status(400).json({
        Error: [
          {
            email: email,
            inputType: `email`,
            message: `User already exist`,
          },
        ],
      });
    } else {
      const salt = await bcrypt.genSalt(10);
      const hashpassword = await bcrypt.hash(password, salt);

      console.info(`salt: ${salt} \n hashpassword : ${hashpassword}`);

      try {
        const userDetails = UserDetails({
          fullname: fullname,
          location: location,
          DOB: dob,
        });

        const resultDetails = await userDetails.save();

        const otp = generateOTP();
        const sendOtpInEmail = sendEmailOTP(email, otp);

        const hashOtp = await bcrypt.hash(otp, salt);

        const data = User({
          email: email,
          password: hashpassword,
          pin: hashOtp,
          user_exist: true,
          userDetails: resultDetails,
        });

        const userdata = await data.save();
        console.info(`User Successfully \n ${userdata}`);

        const userInfo = await User.findOne({ _id: userdata._id }).populate(
          "userDetails"
        );
        if (userdata) {
          return res.status(200).json({
            message: `Sucessfully inserted`,
            user: userInfo,
          });
        }
      } catch (error) {
        console.log(error.message);
        return res.status(503).json({
          Error: [
            {
              error: error.message,
              message: `Please contact to adminstator`,
            },
          ],
        });
      }
    }
  },

  userLogin: async (req, res) => {
    const { email, password } = req.body;

    try {
      const userData = await User.findOne({ email: email });

      if (!userData) {
        return res.status(400).json({
          Error: [
            {
              inputType: `email`,
              message: `Email invalid`,
            },
          ],
        });
      } else {
        if (userData.user_exist) {
          let isMatch = await bcrypt.compare(password, userData.password);

          if (!isMatch) {
            return res.status(401).json({
              Error: [
                {
                  inputType: `password`,
                  message: `Password is invalid`,
                },
              ],
            });
          } else {
            const data = await User.findOne({ _id: userData._id }).populate(
              "userDetails"
            );
            return res.status(200).json({
              message: `Successfully login`,
              user: data,
            });
          }
        } else {
          return res.status(200).json({
            Error: [
              {
                inputType: `email`,
                message: `Your account as been deleted please contact us`,
              },
            ],
          });
        }
      }
    } catch (error) {
      console.log(error.message);
      return res.status(503).json({
        Error: [
          {
            error: error.message,
            message: `Please contact to adminstator`,
          },
        ],
      });
    }
  },

  userPinAuthentication: async (req, res) => {
    const { email, otp } = req.body;

    try {
      let isExist = await User.findOne({ email: email });

      if (!isExist) {
        return res.status(400).json({
          Error: [
            {
              message: `user not exist`,
            },
          ],
        });
      } else {
        // console.log(isExist.pin)
        // var pin = isExist.pin
        // const isValidOtp = pin.includes(otp)
        // console.log(pin.includes(otp))

        let isMatch = await bcrypt.compare(otp, isExist.pin);

        if (isMatch) {
          return res.status(200).json({
            message: `Welcome Back`,
            vaild: isMatch,
            user: isExist,
          });
        } else {
          return res.status(401).json({
            Error: [
              {
                inputType: `pin`,
                message: `Pin dose not match`,
              },
            ],
          });
        }
      }
    } catch (error) {
      console.log(error.message);
      return res.status(503).json({
        Error: [
          {
            error: error.message,
            message: `Please contact to adminstator`,
          },
        ],
      });
    }
  },

  userResentOtp: async (req, res) => {
    const { _id } = req.params;
    const { email } = req.body;
    try {
      let isExist = await User.findOne({ email: email });

      if (isExist) {
        const otp = generateOTP();

        const salt = await bcrypt.genSalt(10);
        const hashOtp = await bcrypt.hash(otp, salt);

        const updateOtp = await User.findByIdAndUpdate(
          _id,
          {
            $set: { pin: hashOtp },
          },
          { new: true }
        );

        const result = sendEmailOTP(email, otp);
        return res.status(200).json({
          message: `Successfully resend a OTP`,
          user: updateOtp,
        });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(503).json({
        Error: [
          {
            error: error.message,
            message: `Please contact to adminstator`,
          },
        ],
      });
    }

    // if (!result) {
    //     return res.status(400).json({
    //         Error : [
    //             {
    //                 inputType : `pin`,
    //                 message : `Pin not Send`
    //             }
    //         ]
    //     })
    // } else {
    //     return res.status(200).json({
    //         message : `Pin send to Autherised mail address`
    //     })
    // }
  },

  userUploadFiles: async (req, res) => {
    const { _id } = req.params;
    const { gender } = req.body;

    if (req.files === undefined) {
      return res.status(400).json({
        Error: [
          {
            message: `You must select a file`,
          },
        ],
      });
    } else {
      const userImage = req.files.profileImage;
      const userVideo = req.files.video;

      const UpdateMedia = await UserDetails.findByIdAndUpdate(
        _id,
        {
          $set: {
            Gender: gender,
            media: {
              image: `http://localhost:5000/${req.files.profileImage[0].path}`,
              video: `http://localhost:5000/${req.files.video[0].path}`,
            },
          },
        },
        { new: true }
      );

      if (!UpdateMedia) {
        return res.status(200).json({
          Error: [
            {
              message: `Failed`,
              data: UpdateMedia,
            },
          ],
        });
      } else {
        return res.status(200).json({
          message: `Files Successfully inserted`,
          data: UpdateMedia,
        });
      }
    }
  },

  userBioAndLinks: async (req, res) => {
    const { Bio, linkedln, facebook } = req.body;
    const { _id } = req.params;

    try {
      const updateBioAndLinks = await UserDetails.findByIdAndUpdate(
        _id,
        {
          $set: {
            bio: Bio,
            links: {
              linkedln: `https://${linkedln}`,
              facebook: `https://${facebook}`,
            },
          },
        },
        { new: true }
      );

      if (!updateBioAndLinks) {
        return res.status(200).json({
          Error: [
            {
              message: `Data Not found`,
            },
          ],
        });
      } else {
        return res.status(200).json({
          message: `Data update successfully`,
          _id: _id,
          user: updateBioAndLinks,
        });
      }
    } catch (error) {
      console.log(error.message);
      return res.status(503).json({
        Error: [
          {
            error: error.message,
            message: `Please contact to adminstator`,
          },
        ],
      });
    }
  },

  updateOperation: async (req, res) => {
    const { _id, option } = req.params;
    const body = req.body;

    try {
      switch (option) {
        case "personal-details":
          const updateEmailDetails = await User.findByIdAndUpdate(
            _id,
            {
              $set: {
                email: body.email,
              },
            },
            { new: true }
          );

          if (!updateEmailDetails) {
            return res.status(200).json({
              Error: [
                {
                  message: `Data Not found`,
                  data: req.body,
                },
              ],
            });
          } else {
            const user_details_id = updateEmailDetails.userDetails;

            const updatePersonalDetails = await UserDetails.findByIdAndUpdate(
              user_details_id,
              {
                $set: {
                  fullname: body.fullname,
                  DOB: body.dob,
                  location: body.location,
                },
              },
              { new: true }
            );
            const user_all_Details = await User.findOne({ _id: _id }).populate(
              "userDetails"
            );

            if (!updatePersonalDetails) {
              return res.status(400).json({
                Error: [
                  {
                    error: `Data Not Update`,
                  },
                ],
              });
            }
            return res.status(200).json({
              message: `Data update successfully`,
              user: user_all_Details,
            });
          }

          break;

        case "change-password":
          // const changePassword = await userSchema.findByIdAndUpdate()
          try {
            const userData = await User.findById(_id);
            console.log(userData);
            if (!userData) {
              return res.status(400).json({
                Error: [
                  {
                    message: `user not found`,
                  },
                ],
              });
            } else {
              let isMatch = await bcrypt.compare(
                body.oldPassword,
                userData.password
              );

              if (!isMatch) {
                return res.status(401).json({
                  Error: [
                    {
                      inputType: `oldPassword`,
                      message: `Old password not match`,
                    },
                  ],
                });
              } else {
                const salt = await bcrypt.genSalt(10);
                const hashpassword = await bcrypt.hash(body.newPassword, salt);
                const set_new_password = await User.findByIdAndUpdate(
                  _id,
                  {
                    $set: {
                      password: hashpassword,
                    },
                  },
                  { new: true }
                );

                if (set_new_password) {
                  return res.status(200).json({
                    message: `password Successfully Updated`,
                    user: set_new_password,
                  });
                }
              }
            }

            return res.status(200).json({
              data: userData,
            });
          } catch (error) {
            console.log(error.message);
            return res.status(400).json({
              Error: [
                {
                  error: error.message,
                  message: `Please contact to adminstator`,
                },
              ],
            });
          }

          break;

        case "delete-account":
          const delete_account = await User.findByIdAndUpdate(
            _id,
            {
              $set: {
                reason: body.reson,
                user_exist: false,
              },
            },
            { new: true }
          );

          if (delete_account) {
            return res.status(200).json({
              message: `user accound successsfully deleted`,
              data: delete_account,
            });
          }
          break;

        default:
          break;
      }
    } catch (error) {
      console.log(error.message);
      return res.status(503).json({
        Error: [
          {
            error: error.message,
            message: `Please contact to adminstator`,
          },
        ],
      });
    }
  },
};
