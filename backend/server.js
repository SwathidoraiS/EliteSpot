const express = require("express");
const cors = require("cors");
const { connectDB, sql } = require("./config/db");
const parkingRoutes = require("./routes/parkingRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const userRoutes = require("./routes/userRoutes");
const cameraRoutes = require("./routes/cameraRoutes");
const errorHandler = require("./middlewares/errorMiddleware");
<<<<<<< HEAD
connectDB();
=======
const authRoutes = require("./routes/authRoutes");
//const processFiles = require("./utils/jsonProcessor");
const dashboardRoutes = require("./routes/dashboardRoutes");

>>>>>>> 701457f (updated)

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/camera", cameraRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/bookings", bookingRoutes);
<<<<<<< HEAD
app.use("/api/users", userRoutes);

=======
app.use("/api", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
>>>>>>> 701457f (updated)
app.get("/", (req, res) => {
  res.json({ message: "Server is running 🚀" });
});

<<<<<<< HEAD
=======
const startServer = async () => {
  await connectDB(); // 🔥 wait until DB connects

  // Json File Run every 5 seconds
//setInterval(() => {
//processFiles();
//}, 5000);

  app.listen(5000, () => {
    console.log("🚀 Server running on http://localhost:5000");
  });
};

startServer();

>>>>>>> 701457f (updated)
// Error middleware MUST be last
app.use(errorHandler);

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});