const upload = require("../../middleware/UploadImage");
const {
  userUploadFiles,
  userRegistration,
  userResentOtp,
  userBioAndLinks,
  userPinAuthentication,
  userLogin,
  updateOperation,
} = require("./users.controller");
const router = require("express").Router();

const mediaUplaod = upload.fields([
  { name: "profileImage", maxCount: 1 },
  { name: "video", maxCount: 1 },
]);

router.post("/", userRegistration);
router.patch("/:_id", userResentOtp);
router.patch("/details/:_id", userBioAndLinks);
router.post("/otpVerified/", userPinAuthentication);
router.post("/login/", userLogin);
router.patch("/Update/:_id/:option", updateOperation);

router.patch("/media/:_id", mediaUplaod, userUploadFiles);

module.exports = router;
