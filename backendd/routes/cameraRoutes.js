const express = require("express");
const router = express.Router();
const { users, bookings, slots, entryLogs } = require("../data/store");

router.post("/entry", (req, res) => {
  const { plateNumber, entryTime } = req.body;

  if (!plateNumber) {
    return res.status(400).json({ message: "Plate number required" });
  }

  // 1️⃣ Check user
  const user = users.find(u => u.plateNumber === plateNumber);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "Vehicle not registered"
    });
  }

  // 2️⃣ Check booking
  const booking = bookings.find(b => b.plateNumber === plateNumber);

  if (!booking) {
    return res.status(400).json({
      success: false,
      message: "No booking found"
    });
  }

  // 3️⃣ Update slot to parked
  const slot = slots.find(s => s.id === booking.slotId);

  if (slot) {
    slot.status = "parked";
  }

  // 4️⃣ Save entry log
  entryLogs.push({
    plateNumber,
    slotId: booking.slotId,
    entryTime
  });

  res.json({
    success: true,
    message: "Vehicle parked successfully",
    slot: booking.slotId
  });
});

module.exports = router;
