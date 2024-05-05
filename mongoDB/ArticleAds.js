const mongoose = require("mongoose");

const articleAdsSchema = new mongoose.Schema({
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
  image5: {
    type: String,
    default: "",
  },
  link5: {
    type: String,
    default: "",
  },
  image6: {
    type: String,
    default: "",
  },
  link6: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const articleAdsModel = mongoose.model("ArticleAds", articleAdsSchema);

module.exports = articleAdsModel;
