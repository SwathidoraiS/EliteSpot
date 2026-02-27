const express = require("express");
const cors = require("cors");
const { connectDB, sql } = require("./config/db");
const parkingRoutes = require("./routes/parkingRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const userRoutes = require("./routes/userRoutes");
const cameraRoutes = require("./routes/cameraRoutes");
const errorHandler = require("./middlewares/errorMiddleware");
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/camera", cameraRoutes);
app.use("/api/parking", parkingRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Server is running 🚀" });
});

// Error middleware MUST be last
app.use(errorHandler);

//Test Route
app.get("/api/test", async (req, res) => {
  try {
    const result = await sql.query("SELECT GETDATE() AS CurrentTime");
    res.json(result.recordset);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//Testing parking 
app.get("/api/test-insert-area", async (req, res) => {
  try {
    const result = await sql.query(`
      INSERT INTO Parking_Area (Area_name, location)
      VALUES ('Main Parking', 'Tokyo Block A')
    `);

    res.json({ message: "Parking Area Inserted Successfully ✅" });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});