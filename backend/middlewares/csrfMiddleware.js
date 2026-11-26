const crypto = require("crypto");

const createCsrfToken = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  const randomToken = crypto.randomBytes(32).toString("hex");

  const signature = crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(randomToken)
    .digest("hex");

  return `${randomToken}.${signature}`;
};

const verifyCsrfToken = (token) => {
  if (!token || typeof token !== "string") return false;
  if (!process.env.JWT_SECRET) return false;

  const parts = token.split(".");
  if (parts.length !== 2) return false;

  const [randomToken, receivedSignature] = parts;

  if (!/^[a-f0-9]{64}$/.test(randomToken)) return false;
  if (!/^[a-f0-9]{64}$/.test(receivedSignature)) return false;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.JWT_SECRET)
    .update(randomToken)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(receivedSignature, "hex"),
    Buffer.from(expectedSignature, "hex")
  );
};

const csrfMiddleware = (req, res, next) => {
  const safeMethods = ["GET", "HEAD", "OPTIONS"];

  if (safeMethods.includes(req.method)) {
    return next();
  }

  // Camera webhook uses its own Digest Authentication.
  if (
    req.path === "/api/camera" ||
    req.path.startsWith("/api/camera/")
  ) {
    return next();
  }

  // Validate the request origin.
  const origin = req.get("Origin");
  const frontendUrl = process.env.FRONTEND_BASE_URL;

  if (!frontendUrl) {
    console.error("FRONTEND_BASE_URL is not configured");

    return res.status(500).json({
      success: false,
      message: "Server security configuration error"
    });
  }

  let expectedOrigin;

  try {
    expectedOrigin = new URL(frontendUrl).origin;
  } catch (error) {
    console.error("Invalid FRONTEND_BASE_URL");

    return res.status(500).json({
      success: false,
      message: "Server security configuration error"
    });
  }

  if (!origin || origin !== expectedOrigin) {
    return res.status(403).json({
      success: false,
      message: "Invalid request origin"
    });
  }

  // Validate CSRF token for ALL unsafe requests,
  // including requests made before authentication.
  const cookieToken = req.cookies?.csrfToken;
  const headerToken = req.get("X-CSRF-Token");

  if (
    !cookieToken ||
    !headerToken ||
    cookieToken !== headerToken ||
    !verifyCsrfToken(cookieToken)
  ) {
    return res.status(403).json({
      success: false,
      message: "Invalid or missing CSRF token"
    });
  }

  next();
};

module.exports = {
  createCsrfToken,
  verifyCsrfToken,
  csrfMiddleware
};