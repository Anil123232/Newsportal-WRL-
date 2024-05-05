const mongoose = require("mongoose");

const UserInfoSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    default:"",
    index: {
      unique: true,
    },
  },
  email: {
    type: String,
    required: true,
    index: {
      unique: true,
    },
  },
  password: {
    type: String,
    required: true,
  },
  profilePic: {
    type: String,
    default: "https://res.cloudinary.com/dfmzsqto7/image/upload/v1692032532/Admin-Profile-Vector-PNG-File_pw0l5u.png",
  },
  bio: {
    type: String,
    default: "",
  },
  role: {
    type: String,
    default: "",
  },
});

const UserInfoModel = mongoose.model("userInformation", UserInfoSchema);

module.exports = UserInfoModel;
