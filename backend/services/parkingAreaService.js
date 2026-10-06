const { sql } = require("../config/db");
const logger = require("../utils/logger");
/**
 * 🚗 Get all active parking areas
 * - Fetches only areas where is_active = 1
 */
const getParkingAreas = async () => {

  logger.info("Fetching active parking areas");

  const result = await sql.query`
    SELECT area_id, Area_name
    FROM Parking_Area
    WHERE is_active = 1
  `;

  logger.info("Parking areas fetched successfully", {
      totalAreas: result.recordset.length
  });

  // Return list of parking areas
  return result.recordset;
};

module.exports = { getParkingAreas };