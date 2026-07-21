const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const authLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,

  skip: (req) => req.method === "OPTIONS",

  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many login attempts. Try again later."
    });
  }
});
const PORT = process.env.PORT || 5000;
const compression = require("compression");
const { connectDB } = require("./config/db");

// 📦 Routes
const parkingAreaRoutes = require("./routes/parkingAreaRoutes");
const parkingRoutes = require("./routes/parkingRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const userRoutes = require("./routes/userRoutes");
const cameraRoutes = require("./routes/cameraRoutes");
const authRoutes = require("./routes/authRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const feedbackRoutes = require("./routes/feedbackRoutes");
const adminRoutes = require("./routes/adminRoutes");

// ⚙️ Middleware
const errorHandler = require("./middlewares/errorMiddleware");

const app = express();
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET is missing");
}
app.set("trust proxy", 1);
app.use(compression());
/* =========================================================
   🔧 Global Middlewares
========================================================= */
app.use(
  helmet({
    contentSecurityPolicy: false
  })
);

app.use(cors({
  origin: process.env.FRONTEND_BASE_URL,
  credentials: true
}));
app.use("/api/auth", authLimiter);

app.use(express.json({
   limit: "10kb"
}));

app.use(express.urlencoded({
  extended: true,
  limit: "10kb"
}));

/* =========================================================
   📌 API Routes
========================================================= */
app.use("/api/parking-areas", parkingAreaRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/camera", cameraRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", userRoutes); // ✅ improved base path
app.use("/api/feedback", feedbackRoutes);
app.use("/api/admin", adminRoutes); // ✅ MUST EXIST
require("./services/bookingReminderService");
/* =========================================================
   🏠 Health Check
========================================================= */
app.get("/", (req, res) => {
  res.status(200).json({
      success: true,
      message: "Server is running"
   });
});

/* =========================================================
   🚀 Start Server
========================================================= */
let server;

const startServer = async () => {

  try {

    await connectDB();

    const startAutoCancelService =
      require("./services/autoCancelService");

    startAutoCancelService();

   server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
   });

  } catch (err) {

    console.error("Startup failed:", err.message);
    process.exit(1);

  }

};

startServer();

/* =========================================================
   ❗ 404 Handler
========================================================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "API route not found"
  });
});

/* =========================================================
   ❗ Error Middleware 
========================================================= */

app.use(errorHandler);

process.on("unhandledRejection", (err) => {
  console.error("Unhandled Rejection:", err.message);
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.error("Uncaught Exception:", err.message);
  process.exit(1);
});

process.on("SIGINT", () => {

  console.log("Shutting down server...");

  server.close(() => {

    console.log("Server closed");

    process.exit(0);

  });

});