const express = require("express");
const router = express.Router();
const { slots, bookings } = require("../data/store");

// GET all bookings
router.get("/", (_, res) => {
  res.json({ success: true, bookings });
});

// CREATE booking
router.post("/", (req, res) => {
  const { slotId, date, fromTime, toTime } = req.body;

  const slot = slots.find(s => s.id === slotId);
  if (!slot) return res.status(404).json({ message: "Slot not found" });
  if (slot.status !== "available")
    return res.status(400).json({ message: "Slot already reserved" });

  const booking = {
    id: Date.now().toString(),
    slotId,
    date,
    fromTime,
    toTime
  };

  bookings.push(booking);
  slot.status = "reserved";

  res.json({ success: true, booking });
});

// CANCEL booking
router.put("/:bookingId", (req, res) => {
  const index = bookings.findIndex(b => b.id === req.params.bookingId);
  if (index === -1)
    return res.status(404).json({ message: "Booking not found" });

  const { slotId } = bookings[index];
  const slot = slots.find(s => s.id === slotId);
  if (slot) slot.status = "available";

  bookings.splice(index, 1);

  res.json({ success: true, message: "Cancelled successfully" });
});

module.exports = router;
