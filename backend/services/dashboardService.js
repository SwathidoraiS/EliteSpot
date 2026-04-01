const { sql } = require("../config/db");

/**
 * 📊 Get dashboard data
 * - available slots (based on booking overlap)
 * - parked slots (from dashboard table)
 */
const getDashboardData = async (date, start, end) => {
  // ❗ If no filters → return only parked slots
  if (!date || !start || !end) {
    const parkedResult = await sql.query`
      SELECT parked_slots FROM dashboard WHERE id = 1
    `;

    return {
      available_slots: 0,
      parked_slots: parkedResult.recordset[0]?.parked_slots || 0,
    };
  }

  const startTime = `${date} ${start}:00`;
  const endTime = `${date} ${end}:00`;

  /* =========================================================
     ✅ 1. AVAILABLE SLOTS (based on bookings)
  ========================================================= */
  const availableResult = await sql.query`
    SELECT COUNT(*) AS available_slots
    FROM Slots s
    WHERE NOT EXISTS (
      SELECT 1 FROM Booking b
      WHERE b.slot_id = s.slot_id
      AND b.booking_stat = 1
      AND b.status = 'BOOKED'
      AND b.booking_start < ${endTime}
      AND b.booking_end > ${startTime}
    )
  `;

  /* =========================================================
     ✅ 2. PARKED SLOTS (from dashboard table)
  ========================================================= */
  const parkedResult = await sql.query`
    SELECT parked_slots FROM dashboard WHERE id = 1
  `;

  return {
    available_slots: availableResult.recordset[0].available_slots,
    parked_slots: parkedResult.recordset[0]?.parked_slots || 0,
  };
};

module.exports = { getDashboardData };