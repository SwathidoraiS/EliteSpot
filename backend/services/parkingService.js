const { sql } = require("../config/db");
const logger = require("../utils/logger");
/**
 * 🅿️ Get parking layout
 * - Returns slot status (available / reserved / parked)
 * - Also returns counts
 */
const getLayout = async (parkingId, startTime, endTime) => {

  logger.info("Fetching parking layout", {
    parkingId,
    startTime,
    endTime
  });

  const now = new Date();

  // ❌ Prevent past time queries
  if (new Date(startTime) < now) {
    logger.warn("Layout request rejected: past time", {
      parkingId,
      startTime
    });

    throw new Error("Cannot fetch layout for past time");
  }

  // 🔄 Swap if start > end
  if (new Date(startTime) > new Date(endTime)) {
    logger.warn("Layout start time is after end time. Swapping values", {
      parkingId,
      startTime,
      endTime
    });
    [startTime, endTime] = [endTime, startTime];
  }

  /* =========================================================
     📊 Fetch slots with booking overlap logic
  ========================================================= */
  const result = await sql.query`
  SELECT
    s.slot_id,
    s.slot_number,
    CASE
      WHEN b.status = 'PARKED' THEN 'parked'
      WHEN b.status = 'BOOKED' THEN 'reserved'
      WHEN br.request_id IS NOT NULL THEN 'reserved'
      ELSE 'available'
    END AS status
  FROM Slots s
  LEFT JOIN Booking b
    ON s.slot_id = b.slot_id
    AND b.booking_stat = 1
    AND b.status IN ('BOOKED', 'PARKED')
    AND b.booking_start < ${endTime}
    AND b.booking_end > ${startTime}
  LEFT JOIN BusinessTripRequest br
    ON s.slot_id = br.slot_id
    AND br.status IN ('PENDING', 'APPROVED')
    AND br.from_datetime < ${endTime}
    AND br.to_datetime > ${startTime}
  WHERE s.area_id = ${parkingId}
  `;

  const slots = result.recordset;

  logger.info("Parking layout slots fetched", {
    parkingId,
    totalSlots: slots.length
  });

  /* =========================================================
     🔢 Count slot statuses
  ========================================================= */
  const counts = slots.reduce(
    (acc, slot) => {
      acc[slot.status] = (acc[slot.status] || 0) + 1;
      return acc;
    },
    {}
  );

  logger.info("Parking layout status calculated", {
    parkingId,
    availableCount: counts.available || 0,
    reservedCount: counts.reserved || 0,
    parkedCount: counts.parked || 0
  });

  return {
    parkingId,
    slots,
    availableCount: counts.available || 0,
    parkedCount: counts.parked || 0,
  };
};

module.exports = { getLayout };