const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  body: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  profile: {
    type: String,
    required: true,
  },
  post: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "post",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const CommentModel = mongoose.model("Comment", commentSchema);

module.exports = CommentModel;
