const express = require("express");
const cors = require("cors");
const { connectDB, sql } = require("./config/db");
const parkingAreaRoutes = require("./routes/parkingAreaRoutes");
const parkingRoutes = require("./routes/parkingRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const userRoutes = require("./routes/userRoutes");
const cameraRoutes = require("./routes/cameraRoutes");
const errorHandler = require("./middlewares/errorMiddleware");
const authRoutes = require("./routes/authRoutes");
//const processFiles = require("./utils/jsonProcessor");
const dashboardRoutes = require("./routes/dashboardRoutes");


const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/parking-areas",parkingAreaRoutes);
app.use("/api/camera", cameraRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api", userRoutes);
app.get("/", (req, res) => {
  res.json({ message: "Server is running 🚀" });
});

const startServer = async () => {
  await connectDB(); // 🔥 wait until DB connects

   require("./services/autoCancelService");
//setInterval(() => {
//processFiles();
//}, 5000);


  app.listen(5000, () => {
    console.log("🚀 Server running on http://localhost:5000");
  });
};

startServer();

// Error middleware MUST be last
app.use(errorHandler);



