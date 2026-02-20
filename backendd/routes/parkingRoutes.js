const express = require("express");
const router = express.Router();
const { slots } = require("../data/store");

router.get("/:parkingId/layout", (req, res) => {
  const counts = slots.reduce(
    (acc, s) => {
      acc[s.status]++;
      return acc;
    },
    { available: 0, reserved: 0 }
  );

  res.json({
    parkingId: req.params.parkingId,
    slots,
    availableCount: counts.available,
    reservedCount: counts.reserved
  });
});

module.exports = router;
