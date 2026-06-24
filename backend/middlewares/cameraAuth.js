module.exports = (req, res, next) => {

  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      success: false,
      message: "No credentials"
    });
  }

  const token = authHeader.split(" ")[1];

  const decoded = Buffer
    .from(token, "base64")
    .toString("utf8");

  const [username, password] = decoded.split(":");

  if (
    username !== process.env.CAMERA_USERNAME ||
    password !== process.env.CAMERA_PASSWORD
  ) {
    return res.status(401).json({
      success: false,
      message: "Invalid credentials"
    });
  }

  next();
};