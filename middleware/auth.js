const jwt = require("jsonwebtoken");
const User = require("../model/userModel");
const Student = require("../model/studentModel");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    console.log("Authorization:", authHeader);

    if (!authHeader) {
      return res.status(401).send({
        message: "Authorization header is missing",
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY || "nodejs");

    req.token = token;

    let account = null;

    // token payload example: { id: "...", role: "student" }
    console.log("decoded",decoded)
    if (decoded.role === "student") {
      account = await Student.findById(decoded._id);
      req.student = account;
    } else {
      account = await User.findById(decoded._id);
      req.user = account;
    }

    if (!account) {
      return res.status(404).send({
        message: `${decoded.role || "User"} not found`,
      });
    }

    next();
  } catch (e) {
    console.error("Authentication error:", e);
    return res.status(401).send({
      message: "Authentication error",
    });
  }
};

const authorizationRole = (role) => {
  return (req, res, next) => {
    const currentUser = req.user || req.student;

    if (!currentUser || !currentUser.role) {
      console.log("Check role");
      return res.status(401).send("User not authenticated");
    }

    if (Array.isArray(role)) {
      if (!role.includes(currentUser.role)) {
        console.log("No Access");
        return res.status(403).send("Forbidden Access - Not allowed");
      }
    } else {
      if (currentUser.role !== role) {
        console.log("No Access");
        return res.status(403).send("Forbidden Access - Not allowed");
      }
    }

    console.log("Access");
    next();
  };
};

module.exports = { auth, authorizationRole };