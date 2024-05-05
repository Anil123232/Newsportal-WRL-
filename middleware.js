const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const UserInfoModel = require("./mongoDB/UserInfo");


dotenv.config();




// middleware
// const authenticate = (req, res, next) => {
//   const cookies = req.headers.cookie;
//   if (!cookies) {
//     return res.sendStatus(401);
//   }
//   const token = cookies.toString().split("=")[1];
//   if (!token) {
//     return res.sendStatus(401);
//   }

//   jwt.verify(token, process.env.SECRET_KEY, (err, info) => {
//     if (err) {
//       return res.sendStatus(401);
//     }
//     UserInfoModel.findById(info.userId)
//       .then((user) => {
//         if (!user) {
//           return res.sendStatus(401);
//         }
//         req.user = { _id: user._id, role: user.role };
//         next();
//       })
//       .catch((err) => {
//         console.log("Error while finding user:", err);
//         res.status(500).json({ message: "Server error" });
//       });
//   });
// };

const authenticate = (req, res, next) => {
  console.log(req.session)
  // Check if the user's session contains the user information
  if (!req.session || !req.session.token) {
    console.log("not found")
    return res.sendStatus(401);
  }

  // const userId = req.session.user._id;
  // const trimmedUserId = userId.trim();
  const token = req.session.token;
  console.log(token, "this is ");
  

  jwt.verify(token, process.env.SECRET_KEY, (err, info) => {
    if (err) {
      return res.sendStatus(401);
    }
    UserInfoModel.findById(info.userId)
      .then((user) => {
        if (!user) {
          console.log("not user")
          return res.sendStatus(401);
        }
        console.log(user)
        req.user = { _id: user._id, role: user.role };
        next();
      })
      .catch((err) => {
        console.log("Error while finding user:", err);
        res.status(500).json({ message: "Server error" });
      });
  });
};

module.exports = authenticate;
