const { sql } = require("../config/db");

/**
 * 🚗 Get all active parking areas
 * - Fetches only areas where is_active = 1
 */
const getParkingAreas = async () => {
  const result = await sql.query`
    SELECT area_id, Area_name
    FROM Parking_Area
    WHERE is_active = 1
  `;

  // Return list of parking areas
  return result.recordset;
};

module.exports = { getParkingAreas };