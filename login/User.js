const express = require("express");
const dotenv = require("dotenv");
const route = express.Router();
const UserInfoModel = require("../mongoDB/UserInfo");
const PostInfoModel = require("../mongoDB/PostSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("../mongoDB/Connection");
const authenticate = require("../middleware");
const SECRET_KEY = process.env.SECRET_KEY;
dotenv.config();

//signup -- editro and super admin
route.post("/signup", async (req, res) => {
  try {
    const { username, email, password, bio, role, profilePic } = req.body;
    const findEmail = await UserInfoModel.findOne({ email });
    const findUsername = await UserInfoModel.findOne({ username });
    if (findEmail) {
      return res.status(422).json({ message: "email already exists" });
    }
    if (findUsername) {
      return res.status(422).json({ message: "username already exists" });
    }
    if (password.length <= 8) {
      return res
        .status(422)
        .json({ message: "Your password must contains at least 8 letter" });
    }
    if (username.length <= 3 || username.length >= 20) {
      return res.status(422).json({
        message:
          "Your username must contains at least 3 letter and not more than 20 letters",
      });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const signupUser = new UserInfoModel({
      email,
      password: hashedPassword,
      username,
      bio,
      role,
      profilePic,
    });
    await signupUser.save();
    res.status(200).json({ message: "Sucessfully!! Created User" });
  } catch (err) {
    console.log(err);
  }
});

//login -- user
route.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  console.log(email, password);
  const findEmail = await UserInfoModel.findOne({ email });
  if (!findEmail || findEmail == null) {
    res.status(422).json({ message: "Email not found" });
  } else {
    const decryptPass = await bcrypt.compare(password, findEmail.password);
    if (decryptPass) {
      req.session.user = { _id: findEmail._id, role: findEmail.role };

      // Generate JWT token using the session user data
      const token = jwt.sign({ userId: findEmail._id }, SECRET_KEY);

      // Store token in the session
      req.session.token = token;

      // jwt.sign({ userId: findEmail._id }, SECRET_KEY, (err, token) => {
      //   if (err) {
      //     return res.status(404).json({ message: "You must login first" });
      //   }
      //   // const cookieExpiration = new Date(Date.now() + 120 * 1000); // 120 seconds in milliseconds
      //   // res.cookie(String(findEmail._id), token, {
      //   //   path: "/",
      //   //   // expires: new Date(Date.now() + 1000 * 60 * 60 * 24),
      //   //   // expires: cookieExpiration,
      //   //   httpOnly: true,
      //   //   sameSite: "lax",
      //   // });
      //   console.log(token, "this is token");
      // });
      res
        .status(200)
        .json({ message: "Successfully, logged in", role: findEmail.role });
    } else {
      res.status(422).json({ message: "Email or Password doesn't match" });
    }
  }
});

// logout
route.post("/logout", (req, res) => {
  // const cookies = req.headers.cookie;
  // console.log("this is cookies", cookies);
  // const token = cookies.split("=")[1];
  // if (!token) {
  //   return res.sendStatus(401);
  // }

  // jwt.verify(token, process.env.SECRET_KEY, (err, user) => {
  //   if (err) {
  //     return res.sendStatus(401);
  //   }
  //   res.clearCookie(`${user.userId}`);
  //   req.cookies[`${user.id}`] = "";
  //   return res.status(200).json({ message: "successfully logged out" });
  // });

  // Clear the user's session data
  req.session.destroy();

  res.status(200).json({ message: "Successfully logged out" });
});

//protocted route
route.get("/chitrawankhabar/verify", authenticate, (req, res) => {
  res.send(req.user);
});

// get user
route.get("/user", authenticate, async (req, res) => {
  const userId = req.user;
  try {
    const user = await UserInfoModel.findById(userId, "-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// update user
route.put("/edit-user", authenticate, async (req, res) => {
  const userId = req.user;
  const { username, email, bio } = req.body;
  console.log(bio);
  try {
    const user = await UserInfoModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if new email already exists
    const existingUserWithEmail = await UserInfoModel.findOne({ email });

    if (existingUserWithEmail) {
      if (existingUserWithEmail._id.toString() !== userId.toString()) {
        return res.status(400).json({ message: "Email is already in use" });
      } else {
        // Update only username
        user.username = username;
        user.bio = bio;
      }
    } else {
      // console.log(existingUserWithEmail._id.toString(), userId.toString());

      // Update both username and email
      user.username = username;
      user.email = email;
      user.bio = bio;
    }

    await user.save();

    res.status(200).json({ message: "User updated successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// change password
route.post("/change-password", authenticate, async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user;

  try {
    const user = await UserInfoModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid old password" });
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// update user-image
route.post("/edit-img", authenticate, async (req, res) => {
  const profilePic = req.body.img;
  const userId = req.user;

  try {
    const user = await UserInfoModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.profilePic = profilePic;
    await user.save();

    res.status(200).json({ message: "Profile picture updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// get all user
route.get("/getalluser", authenticate, async (req, res) => {
  try {
    const currentUser = req.user._id;
    const allUser = await UserInfoModel.find({
      _id: { $ne: currentUser },
    }).exec();
    res.status(200).json({ users: allUser });
  } catch (err) {
    res.status(422).json({ message: err.message });
  }
});

// Delete user by ID route
route.delete("/deleteuser/:id", authenticate, async (req, res) => {
  try {
    const userIdToDelete = req.params.id;

    // Check if the user exists
    const userToDelete = await UserInfoModel.findById(userIdToDelete).exec();
    if (!userToDelete) {
      return res.status(404).json({ message: "User not found" });
    }

    // You can also add additional checks here to ensure that the user has permission to delete

    await UserInfoModel.findByIdAndDelete(userIdToDelete).exec();
    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// update user role
// Update user role route
route.post("/update-role/:userId", authenticate, async (req, res) => {
  const newRole = req.body.newRole;
  const userId = req.params.userId;

  try {
    const updatedUser = await UserInfoModel.findByIdAndUpdate(
      userId,
      { role: newRole },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User role updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

/// other user profile
route.get("/user/:id", async (req, res) => {
  try {
    const user = await UserInfoModel.findOne({ _id: req.params.id }).select(
      "-password -role -_id"
    );
    const post = await PostInfoModel.find({ postedBy: req.params.id })
      .sort({ createdAt: -1 })
      .populate("postedBy", "_id profilePic username email")
      .exec();
    res.status(200).json({ user, post });
  } catch (err) {
    res.status(422).json({ message: err.message });
  }
});

module.exports = route;
