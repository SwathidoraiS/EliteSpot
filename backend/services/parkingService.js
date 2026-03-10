const { sql } = require("../config/db");

const getLayout = async(parkingId, startTime, endTime) => {

  const result = await sql.query`
    SELECT 
        s.slot_id,
        s.slot_number,
        CASE 
            WHEN b.slot_id IS NOT NULL THEN 'reserved'
            ELSE 'available'
        END AS status
    FROM Slots s
    LEFT JOIN Booking b
    ON s.slot_id = b.slot_id
    AND b.booking_stat = 1
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