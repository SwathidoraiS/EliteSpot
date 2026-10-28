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

const createParkingArea = async ({ areaName, location }) => {
  const name = typeof areaName === "string" ? areaName.trim() : "";
  const areaLocation =
    typeof location === "string" ? location.trim() : "";

  if (!name || name.length > 255) {
    throw new Error("Parking area name is required and must be at most 255 characters");
  }

  if (!areaLocation || areaLocation.length > 255) {
    throw new Error("Location is required and must be at most 255 characters");
  }

  const request = new sql.Request();

  request.input("areaName", sql.VarChar(255), name);
  request.input("location", sql.VarChar(255), areaLocation);

  const result = await request.query(`
    INSERT INTO dbo.Parking_Area
      (Area_name, location, is_active, created_at)
    OUTPUT
      INSERTED.area_id,
      INSERTED.Area_name,
      INSERTED.location,
      INSERTED.is_active,
      INSERTED.created_at
    VALUES
      (@areaName, @location, 1, GETDATE());
  `);

  logger.info("Parking area created", {
    areaId: result.recordset[0].area_id,
    areaName: result.recordset[0].Area_name,
  });

  return result.recordset[0];
};


module.exports = { getParkingAreas, createParkingArea };