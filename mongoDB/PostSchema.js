const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema.Types;

const userSchema = new mongoose.Schema(
  {
    picture: {
      type: String,
      default: "",
    },
    content: {
      type: String,
      default: "",
    },
    postedBy: {
      type: ObjectId,
      ref: "userInformation",
    },
    title: {
      type: String,
      default: "",
    },
    isDraft: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const Postmodel = mongoose.model("post", userSchema);

module.exports = Postmodel;
