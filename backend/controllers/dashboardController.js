const { sql } = require("../config/db");

const getDashboard = async (req, res) => {
  try {

    const debug = await sql.query`SELECT DB_NAME() AS db`;
console.log("Connected DB:", debug.recordset[0].db);
    let { date, start, end } = req.query;

    // ❗ Show nothing if no filter
    if (!date || !start || !end) {

  // still return parked slots
  const parkedResult = await sql.query`
  SELECT parked_slots FROM dashboard WHERE id = 1
`;
  return res.json({
    success: true,
    data: {
      available_slots: 0,
      parked_slots: parkedResult.recordset[0]?.parked_slots || 0
    }
  });
}

    const startTime = `${date} ${start}:00`;
    const endTime = `${date} ${end}:00`;

    // ✅ 1. AVAILABLE → from bookings
    const availableResult = await sql.query`
      SELECT 
        COUNT(*) AS available_slots
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

    // ✅ 2. PARKED → from dashboard table
    const parkedResult = await sql.query`
  SELECT parked_slots FROM dashboard WHERE id = 1
`;
    console.log("DB result:", parkedResult.recordset);

    res.json({
      success: true,
      data: {
        available_slots: availableResult.recordset[0].available_slots,
        parked_slots: parkedResult.recordset[0]?.parked_slots || 0
      }
    });

  } catch (err) {
    console.error("❌ Dashboard Error:", err.message);
    
    res.status(500).json({ success: false });
  }
};

module.exports = { getDashboard };