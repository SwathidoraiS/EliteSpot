const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {

  // Read JWT from HttpOnly cookie
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication required"
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      {
        issuer: "EliteSpot",
        algorithms: ["HS256"]
      }
    );

    req.user = decoded;
    req.user_id = decoded.user_id;

    next();

  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token"
    });
  }
};

module.exports = verifyToken;