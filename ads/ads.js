const express = require("express");
const route = express.Router();
const authenticate = require("../middleware");
const adsModel = require("../mongoDB/Ads");
const articleAdsModel = require("../mongoDB/ArticleAds");
const categoryAdsModel = require("../mongoDB/CategoryAds");

//cretae post
route.post("/createAds", authenticate, async (req, res) => {
  try {
    const { image1, link2, link3, link4, link1, image2, image3, image4 } =
      req.body;

    const adsData = {
      image1,
      image2,
      image3,
      image4,
      link1,
      link3,
      link4,
      link2,
    };

    const adData = new categoryAdsModel(adsData);

    await adData.save();
    res.status(201).json({ message: "ADs created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create post" });
  }
});

// home -ads
route.get("/ads-home", async (req, res) => {
  try {
    const homeAds = await adsModel.find({});

    if (!homeAds) {
      return res.status(404).json({ message: "Ad not found" });
    }
    res.status(200).json({ ads: homeAds });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Define a function to update ad fields
const updateAdFields = async (req, res) => {
  try {
    const id = req.params.id;
    const adNo = req.params.adNo;
    const { image, link } = req.body;

    const updatedFields = {};

    // Construct field names dynamically based on adNo
    const imageField = `image${adNo}`;
    const linkField = `link${adNo}`;

    if (image) {
      updatedFields[imageField] = image;
    }

    if (link) {
      updatedFields[linkField] = link;
    }

    // Find the ad by ID and update the specified fields
    const updatedAd = await adsModel.findByIdAndUpdate(id, updatedFields, {
      new: true,
    });

    if (!updatedAd) {
      return res.status(404).json({ message: "Ad not found" });
    }

    res.status(200).json({ ad: updatedAd });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Use a single route to update ad fields based on adNo
route.put("/homead/:id/:adNo", authenticate, async (req, res) => {
  await updateAdFields(req, res);
});

// / category -ads
route.get("/ads-category", async (req, res) => {
  try {
    const categoryAds = await categoryAdsModel.find({});

    if (!categoryAds) {
      return res.status(404).json({ message: "Ad not found" });
    }
    res.status(200).json({ ads: categoryAds });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Define a function to update ad fields
const updateCategoryFields = async (req, res) => {
  try {
    const id = req.params.id;
    const adNo = req.params.adNo;
    const { image, link } = req.body;

    const updatedFields = {};

    // Construct field names dynamically based on adNo
    const imageField = `image${adNo}`;
    const linkField = `link${adNo}`;

    if (image) {
      updatedFields[imageField] = image;
    }

    if (link) {
      updatedFields[linkField] = link;
    }

    // Find the ad by ID and update the specified fields
    const updatedAd = await categoryAdsModel.findByIdAndUpdate(
      id,
      updatedFields,
      {
        new: true,
      }
    );

    if (!updatedAd) {
      return res.status(404).json({ message: "Ad not found" });
    }

    res.status(200).json({ ad: updatedAd });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

// Use a single route to update ad fields based on adNo
route.put("/categoryad/:id/:adNo", authenticate, async (req, res) => {
  await updateCategoryFields(req, res);
});

// article ads
route.get("/ads-article", async (req, res) => {
  try {
    const articleAds = await articleAdsModel.find({});

    if (!articleAds) {
      return res.status(404).json({ message: "Ad not found" });
    }
    res.status(200).json({ ads: articleAds });
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// Define a function to update ad fields
const updateArticleAds = async (req, res) => {
  try {
    const id = req.params.adArticleId;
    const adNo = req.params.adNoArticle;
    const { image, link } = req.body;

    const updatedFields = {};

    // Construct field names dynamically based on adNo
    const imageField = `image${adNo}`;
    const linkField = `link${adNo}`;

    if (image) {
      updatedFields[imageField] = image;
    }

    if (link) {
      updatedFields[linkField] = link;
    }

    // Find the ad by ID and update the specified fields
    const updatedAd = await articleAdsModel.findByIdAndUpdate(
      id,
      updatedFields,
      {
        new: true,
      }
    );

    if (!updatedAd) {
      return res.status(404).json({ message: "Ad not found" });
    }

    res.status(200).json({ ad: updatedAd });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

route.put(
  "/articlead/:adArticleId/:adNoArticle",
  authenticate,
  async (req, res) => {
    await updateArticleAds(req, res);
  }
);

module.exports = route;
