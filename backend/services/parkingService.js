const { sql } = require("../config/db");

const getLayout = async(parkingId, startTime, endTime) => {

  const now = new Date();

if (new Date(startTime) < now) {
  throw new Error("Cannot fetch layout for past time");
}

  if (new Date(startTime) > new Date(endTime)) {
    const temp = startTime;
    startTime = endTime;
    endTime = temp;
  }

  console.log("Start:", startTime);
  console.log("End:", endTime);

  const result = await sql.query`
    SELECT 
        s.slot_id,
        s.slot_number,
        CASE 
    WHEN b.status = 'PARKED' THEN 'parked'
    WHEN b.status = 'BOOKED' THEN 'reserved'
    ELSE 'available'
END AS status
    FROM Slots s
    LEFT JOIN Booking b
    ON s.slot_id = b.slot_id
    AND b.booking_stat = 1
    AND b.status IN ('BOOKED', 'PARKED')   -- 🔥 ADD THIS
    AND b.booking_start < ${endTime}
    AND b.booking_end > ${startTime}
    WHERE s.area_id = ${parkingId}
    `;


  const slots = result.recordset;

  const counts = slots.reduce(
    (acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    },
    {}
  );

  return {
    parkingId,
    slots,
    availableCount: counts.available || 0,
    parkedCount: counts.parked || 0
  };
};

module.exports = { getLayout };