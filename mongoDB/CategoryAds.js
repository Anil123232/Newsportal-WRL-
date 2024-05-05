const mongoose = require("mongoose");

const categoryAds = new mongoose.Schema({
  image1: {
    type: String,
    default: "",
  },
  link1: {
    type: String,
    default: "",
  },
  image2: {
    type: String,
    default: "",
  },
  link2: {
    type: String,
    default: "",
  },
  image3: {
    type: String,
    default: "",
  },
  link3: {
    type: String,
    default: "",
  },
  image4: {
    type: String,
    default: "",
  },
  link4: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const categoryAdsModel = mongoose.model("CategoryAds", categoryAds);

module.exports = categoryAdsModel;
