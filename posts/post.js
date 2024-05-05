const express = require("express");
const route = express.Router();
const postInfoModel = require("../mongoDB/PostSchema");
const authenticate = require("../middleware");
const CommentModel = require("../mongoDB/CommentSchema");

//cretae post
route.post("/createpost", authenticate, async (req, res) => {
  try {
    const { content, title, category, isDraft } = req.body; // Add isDraft to the destructuring
    const picture = req.body.img;

    if (!isDraft && (!picture || !content || !title || !category)) {
      return res.status(422).json({ message: "Post fields can't be empty" });
    }

    const postData = {
      content,
      picture,
      postedBy: req.user._id,
      title,
      category,
      isDraft: isDraft || false, // Use the provided isDraft or default to false
    };

    const userdata = new postInfoModel(postData);

    await userdata.save();
    res.status(201).json({ message: "Post created successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create post" });
  }
});

// Get all the posts by the authenticated user
route.get("/allpost/user", authenticate, async (req, res) => {
  try {
    const result = await postInfoModel
      .find({ postedBy: req.user._id }) // Only retrieve posts by the authenticated user
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .populate("postedBy", "_id profilePic username")
      .exec();

    res.status(200).json({ result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get all posts" });
  }
});

// edit post for authenticate user
route.get("/edit-post/authenticate/:id", authenticate, async (req, res) => {
  try {
    console.log("hello fasdfd");
    const postId = req.params.id;
    const userId = req.user._id;


    const result = await postInfoModel.findOne({
      _id: postId,
      postedBy: userId, // Check if the postedBy _id matches the authenticated user _id
    });

    if (result) {
      res.status(200).json({ post: result });
    } else {
      res.status(200).json({ message: "Access denied" });
    }
  } catch (err) {
    res.status(500).json({ message: "Failed to authenticate" });
  }
});

// Update post
route.put("/updatepost/:id", authenticate, async (req, res) => {
  try {
    const postId = req.params.id;
    const { content, title, category, isDraft } = req.body;
    const picture = req.body.img;


    if (!picture || !content || !title || !category) {
      return res.status(422).json({ message: "Post fields can't be empty" });
    }

    const postData = {
      content,
      picture,
      title,
      category,
      isDraft: isDraft || false,
    };

    // Check if the post belongs to the authenticated user before updating
    const existingPost = await postInfoModel.findOne({
      _id: postId,
      postedBy: req.user._id,
    });
    if (!existingPost) {
      return res.status(403).json({ message: "Access denied" });
    }

    await postInfoModel.updateOne({ _id: postId }, postData);

    res.status(200).json({ message: "Post updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update post" });
  }
});

// Delete post
route.delete("/deletepost/:id", authenticate, async (req, res) => {
  try {
    const postId = req.params.id;

    // Check if the user is an admin or the post's creator before deleting
    const existingPost = await postInfoModel.findOne({ _id: postId });
    if (!existingPost) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (
      req.user.role === "admin" ||
      existingPost.postedBy._id.toString() === req.user._id.toString()
    ) {
      await postInfoModel.deleteOne({ _id: postId });
      return res.status(200).json({ message: "Post deleted successfully" });
    } else {
      return res.status(403).json({ message: "Access denied" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete post" });
  }
});

// Update isDraft of a post
route.put("/updatepost/:id/isDraft", authenticate, async (req, res) => {
  try {
    const postId = req.params.id;
    const existingPost = await postInfoModel.findOne({
      _id: postId,
      postedBy: req.user._id,
    });

    if (!existingPost) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Toggle the isDraft value
    const updatedIsDraft = !existingPost.isDraft;

    await postInfoModel.updateOne({ _id: postId }, { isDraft: updatedIsDraft });

    res.status(200).json({ message: "isDraft updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update isDraft" });
  }
});

// Get all posts for admin
route.get("/allpost/admin", authenticate, async (req, res) => {
  try {
    const result = await postInfoModel
      .find()
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .populate("postedBy", "_id profilePic fullname gender username")
      .exec();

    res.status(200).json({ result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get all posts" });
  }
});

route.get("/allpost", async (req, res) => {
  try {
    const result = await postInfoModel
      .find({ isDraft: false }) // Filter out draft posts
      .sort({ createdAt: -1 })
      .populate("postedBy", "_id profilePic username")
      .exec();

    res.status(200).json({ result });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to get all posts" });
  }
});

route.get("/article/:title", async (req, res) => {
  const title = req.params.title;

  try {
    const posts = await postInfoModel
      .find({})
      .populate("postedBy", "profilePic username");

    posts.forEach((val) => {
      val.title = val.title.replace(/-/g, " ");
      val.title = val.title
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    });

    const post = posts.find((val) => val.title === title);

    if (!post) {
      console.log("Post not found in the database.");
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json({ post });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({ message: "Failed to get the post" });
  }
});

// Create a new comment
route.post("/:postId/comment", async (req, res) => {
  try {
    const postId = req.params.postId;
    const body = req.body.comment;
    const username = req.body.username;
    const profile = req.body.profile;

    const comment = new CommentModel({
      body,
      username,
      profile,
      post: postId,
    });

    const savedComment = await comment.save();

    res.status(200).json({ savedComment });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

route.get("/:postId/comments", async (req, res) => {
  try {
    const postId = req.params.postId;
    const comments = await CommentModel.find({ post: postId }).sort({
      createdAt: -1,
    });
    res.status(200).json({ comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Get all comments for admin
route.get("/allcomment/admin", authenticate, async (req, res) => {
  try {
    const result = await CommentModel.find()
      .sort({ createdAt: -1 }) // Sort by creation date in descending order
      .populate({
        path: "post",
        select: "title",
        populate: {
          path: "postedBy",
          select: "username email _id", // Select the fields you want to populate
        },
      })
      .exec();

    res.status(200).json({ result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to get all comments" });
  }
});

// Delete comment
route.delete("/deletecomment/:id", authenticate, async (req, res) => {
  try {
    const commentId = req.params.id;

    const existingComment = await CommentModel.findOne({ _id: commentId });
    if (!existingComment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (
      req.user.role === "admin" ||
      existingComment.post.postedBy._id.toString() === req.user._id.toString()
    ) {
      await CommentModel.deleteOne({ _id: commentId });
      console.log("hell no");
      return res.status(200).json({ message: "Comment deleted successfully" });
    } else {
      return res.status(403).json({ message: "Access denied" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete comment " });
  }
});

route.get("/category/:cat", async (req, res) => {
  const category = req.params.cat;

  try {
    const posts = await postInfoModel
      .find({})
      .populate("postedBy", "profilePic username");

    posts.forEach((val) => {
      val.category = val.category.replace(/-/g, " ");
      val.category = val.category
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
    });

    const filteredPosts = posts.filter((val) => val.category === category);

    if (filteredPosts.length === 0) {
      console.log("Posts not found in the database for the given category.");
      // return res.status(404).json({ message: "Posts not found" });
    }

    res.status(200).json({ posts: filteredPosts });
  } catch (err) {
    console.log("Error:", err);
    res.status(500).json({ message: "Failed to get the post" });
  }
});

module.exports = route;
