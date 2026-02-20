const express = require("express");
const cors = require("cors");

const parkingRoutes = require("./routes/parkingRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const userRoutes = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/parking", parkingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);
app.get("/", (req, res) => {
  res.json({ message: "Server is running 🚀" });
});
app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});