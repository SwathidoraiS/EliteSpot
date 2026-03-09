const express = require("express");
const cors = require("cors");
const { connectDB, sql } = require("./config/db");
const parkingRoutes = require("./routes/parkingRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const userRoutes = require("./routes/userRoutes");
const cameraRoutes = require("./routes/cameraRoutes");
const errorHandler = require("./middlewares/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/camera", cameraRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
  res.json({ message: "Server is running 🚀" });
});

// Error middleware MUST be last
app.use(errorHandler);

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});