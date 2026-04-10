const express = require("express");
const cors = require("cors");

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

/* =========================================================
   🔧 Global Middlewares
========================================================= */
app.use(cors());
app.use(express.json());

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
/* =========================================================
   🏠 Health Check
========================================================= */
app.get("/", (req, res) => {
  res.json({ message: "Server is running 🚀" });
});

/* =========================================================
   🚀 Start Server
========================================================= */
const startServer = async () => {
    await connectDB(); // ✅ Ensure DB is connected before starting

    // 🔄 Background services
    // 🔄 Background services
    const startAutoCancelService = require("./services/autoCancelService");
    startAutoCancelService();

    app.listen(5000, () => {
      // Keep only essential log
      console.log("Server running on http://localhost:5000");
    });
};

startServer();

/* =========================================================
   ❗ Error Middleware (MUST BE LAST)
========================================================= */
app.use(errorHandler);