const { sql } = require("../config/db");

const getParkingAreas = async () => {

  const result = await sql.query`
    SELECT area_id, Area_name
    FROM Parking_Area
    WHERE is_active = 1
  `;

  return result.recordset;
};

module.exports = { getParkingAreas };