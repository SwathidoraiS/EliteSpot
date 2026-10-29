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

  const areaResult = await sql.query`
    SELECT layout_width, layout_height
    FROM dbo.Parking_Area
    WHERE area_id = ${Number(parkingId)}
      AND is_active = 1
`;

  if (areaResult.recordset.length === 0) {
    throw new Error("Parking area not found or inactive");
  }

  const {
    layout_width: layoutWidth,
    layout_height: layoutHeight
  } = areaResult.recordset[0];

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
    s.position_x AS x,
    s.position_y AS y,
    s.width,
    s.height,
    s.is_fixed,
    s.rotation AS rotate,
    CASE
      WHEN b.status = 'PARKED' THEN 'parked'
      WHEN b.status = 'BOOKED' THEN 'reserved'
      WHEN br.request_id IS NOT NULL THEN 'reserved'
      WHEN s.is_fixed = 1 THEN 'fixed'
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
      AND (
        br.status = 'PENDING'
        OR (
          br.status = 'APPROVED'
          AND EXISTS (
            SELECT 1
            FROM Booking bb
            WHERE bb.user_id = br.user_id
              AND bb.slot_id = br.slot_id
              AND bb.booking_start = br.from_datetime
              AND bb.booking_end = br.to_datetime
              AND bb.booking_stat = 1
              AND bb.status IN ('BOOKED', 'PARKED')
          )
        )
      )
    AND br.from_datetime < ${endTime}
    AND br.to_datetime > ${startTime}
    WHERE s.area_id = ${parkingId}
    AND s.is_active = 1
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
    layoutWidth,
    layoutHeight,
    slots,
    availableCount: counts.available || 0,
    parkedCount: counts.parked || 0,
  };
};

const saveLayout = async (parkingId, slots) => {

  if (!Number.isInteger(Number(parkingId)) || Number(parkingId) <= 0) {
    throw new Error("Invalid parking area ID");
  }

  if (!Array.isArray(slots) || slots.length === 0) {
    throw new Error("Slots must be a non-empty array");
  }

  const slotIds = slots.map((slot) => slot.slot_id);
  if (new Set(slotIds).size !== slotIds.length) {
    throw new Error("Duplicate slot IDs are not allowed");
  }

  for (const slot of slots) {
    if (
      !slot.slot_id ||
      !Number.isInteger(slot.x) ||
      !Number.isInteger(slot.y) ||
      !Number.isInteger(slot.width) ||
      !Number.isInteger(slot.height) ||
      !Number.isInteger(slot.rotate ?? 0) ||
      (slot.rotate ?? 0) < -360 ||
      (slot.rotate ?? 0) > 360 ||
      slot.x < 0 ||
      slot.y < 0 ||
      slot.width <= 0 ||
      slot.height <= 0
    ) {
      throw new Error(`Invalid layout data for slot: ${slot.slot_id ?? "unknown"}`);
    }
  }

  const transaction = new sql.Transaction();

  try {
    await transaction.begin();

    for (const slot of slots) {
      const request = new sql.Request(transaction);

      request.input("parkingId", sql.Int, Number(parkingId));
      request.input("slotId", sql.VarChar(10), slot.slot_id);
      request.input("x", sql.Int, slot.x);
      request.input("y", sql.Int, slot.y);
      request.input("width", sql.Int, slot.width);
      request.input("height", sql.Int, slot.height);
      request.input("rotation", sql.Int, slot.rotate ?? 0);

      await request.query(`
        UPDATE dbo.Slots
        SET
          position_x = @x,
          position_y = @y,
          width = @width,
          height = @height,
          rotation = @rotation
        WHERE area_id = @parkingId
          AND slot_id = @slotId

        IF @@ROWCOUNT = 0
        THROW 50001, 'Slot does not belong to the selected Parking area', 1;
      `);
    }

    await transaction.commit();

    logger.info("Parking layout saved", {
      parkingId,
      slotCount: slots.length,
    });

    return { parkingId, savedSlots: slots.length };
  } catch (error) {
    await transaction.rollback();
    throw error;
  }
};

const generateSlots = async (parkingId, prefix, count) => {
  const areaId = Number(parkingId);
  const slotPrefix = typeof prefix === "string" ? prefix.trim() : "";

  if (!Number.isInteger(areaId) || areaId <= 0) {
    throw new Error("Invalid parking area ID");
  }

  if (!/^[A-Za-z0-9]{1,4}$/.test(slotPrefix)) {
    throw new Error("Prefix must contain 1–4 letters or numbers");
  }

  if (!Number.isInteger(count) || count < 1 || count > 200) {
    throw new Error("Slot count must be between 1 and 200");
  }

  // Confirm that the parking area exists and is active.
  const areaRequest = new sql.Request();
  areaRequest.input("areaId", sql.Int, areaId);

  const areaResult = await areaRequest.query(`
    SELECT area_id
    FROM dbo.Parking_Area
    WHERE area_id = @areaId
      AND is_active = 1
  `);

  if (areaResult.recordset.length === 0) {
    throw new Error("Parking area not found or inactive");
  }

  const slots = Array.from({ length: count }, (_, index) => {
    const slotNumber = `${slotPrefix}-${String(index + 1).padStart(2, "0")}`;

    return {
      slot_id: slotNumber,
      slot_number: slotNumber,
    };
  });

  // Use a transaction so the operation succeeds or fails as a whole.
  const transaction = new sql.Transaction();

  try {
    await transaction.begin();

    for (const slot of slots) {
      const request = new sql.Request(transaction);

      request.input("areaId", sql.Int, areaId);
      request.input("slotId", sql.VarChar(10), slot.slot_id);
      request.input("slotNumber", sql.VarChar(10), slot.slot_number);

      await request.query(`
        INSERT INTO dbo.Slots (
          slot_id,
          area_id,
          slot_number,
          slot_type,
          is_active,
          created_at,
          position_x,
          position_y,
          width,
          height,
          rotation,
          is_fixed
        )
        VALUES (
          @slotId,
          @areaId,
          @slotNumber,
          'STANDARD',
          1,
          GETDATE(),
          NULL,
          NULL,
          35,
          55,
          0,
          0
        );
      `);
    }

    await transaction.commit();

    logger.info("Parking slots generated", {
      parkingId: areaId,
      prefix: slotPrefix,
      count,
    });

    return {
      parkingId: areaId,
      generatedCount: slots.length,
      slots,
    };
  } catch (error) {
    try {
      await transaction.rollback();
    } catch (rollbackError) {
      logger.error("Slot generation rollback failed", rollbackError);
    }

    throw error;
  }
};

const deleteSlot = async (parkingId, slotId) => {
  if (!Number.isInteger(Number(parkingId)) || Number(parkingId) <= 0) {
    throw new Error("Invalid parking area ID");
  }

  const transaction = new sql.Transaction();

  try {
    await transaction.begin();

    const result = await new sql.Request(transaction)
      .input("areaId", sql.Int, Number(parkingId))
      .input("slotId", sql.VarChar(10), slotId)
      .query(`
        UPDATE dbo.Slots
        SET is_active = 0
        WHERE area_id = @areaId
          AND slot_id = @slotId
          AND is_active = 1;
      `);

    if (result.rowsAffected[0] === 0) {
      throw new Error("Active slot not found in this parking area");
    }

    await transaction.commit();

    logger.info("Parking slot deactivated", {
      parkingId,
      slotId,
    });

    return { parkingId, slotId };
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {
      // Transaction may already have been rolled back.
    }

    throw error;
  }
};

const copySlot = async (parkingId, sourceSlotId) => {
  const areaId = Number(parkingId);

  if (!Number.isInteger(areaId) || areaId <= 0) {
    throw new Error("Invalid parking area ID");
  }

  const transaction = new sql.Transaction();

  try {
    await transaction.begin();

    const sourceResult = await new sql.Request(transaction)
      .input("areaId", sql.Int, areaId)
      .input("sourceSlotId", sql.VarChar(10), sourceSlotId)
      .query(`
        SELECT
          slot_id,
          slot_type,
          width,
          height,
          rotation,
          is_fixed
        FROM dbo.Slots
        WHERE area_id = @areaId
          AND slot_id = @sourceSlotId
          AND is_active = 1;
      `);

    if (sourceResult.recordset.length === 0) {
      throw new Error("Source slot not found or inactive");
    }

    const source = sourceResult.recordset[0];

    // Find a unique slot ID within the 10-character limit.
    let newSlotId;
    let created = false;

    for (let i = 1; i <= 9999; i++) {
      const candidate = `CP${String(i).padStart(4, "0")}`;

      const exists = await new sql.Request(transaction)
        .input("candidate", sql.VarChar(10), candidate)
        .query(`
          SELECT 1
          FROM dbo.Slots
          WHERE slot_id = @candidate;
        `);

      if (exists.recordset.length === 0) {
        newSlotId = candidate;
        created = true;
        break;
      }
    }

    if (!created) {
      throw new Error("Could not generate a unique slot ID");
    }

    const insertResult = await new sql.Request(transaction)
      .input("slotId", sql.VarChar(10), newSlotId)
      .input("areaId", sql.Int, areaId)
      .input("slotType", sql.VarChar(20), source.slot_type)
      .input("width", sql.Int, source.width ?? 35)
      .input("height", sql.Int, source.height ?? 70)
      .input("rotation", sql.Int, source.rotation ?? 0)
      .input("isFixed", sql.Bit, source.is_fixed)
      .query(`
        INSERT INTO dbo.Slots (
          slot_id,
          area_id,
          slot_number,
          slot_type,
          is_active,
          created_at,
          position_x,
          position_y,
          width,
          height,
          rotation,
          is_fixed
        )
        OUTPUT INSERTED.slot_id, INSERTED.slot_number,
               INSERTED.area_id, INSERTED.width,
               INSERTED.height, INSERTED.rotation,
               INSERTED.is_fixed
        VALUES (
          @slotId,
          @areaId,
          @slotId,
          @slotType,
          1,
          GETDATE(),
          NULL,
          NULL,
          @width,
          @height,
          @rotation,
          @isFixed
        );
      `);

    await transaction.commit();

    return insertResult.recordset[0];
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {
      // Transaction may already have been rolled back.
    }

    throw error;
  }
};

const restoreSlot = async (parkingId, slotId) => {
  const areaId = Number(parkingId);

  if (!Number.isInteger(areaId) || areaId <= 0) {
    throw new Error("Invalid parking area ID");
  }

  const request = new sql.Request();

  request.input("areaId", sql.Int, areaId);
  request.input("slotId", sql.VarChar(10), slotId);

  const result = await request.query(`
    UPDATE dbo.Slots
    SET is_active = 1
    WHERE area_id = @areaId
      AND slot_id = @slotId
      AND is_active = 0;
  `);

  if (result.rowsAffected[0] === 0) {
    throw new Error("Deleted slot not found in this parking area");
  }

  logger.info("Parking slot restored", { parkingId, slotId });

  return { parkingId, slotId };
};

const updateSlotNumber = async (parkingId, slotId, newSlotNumber) => {
  const areaId = Number(parkingId);
  const number = typeof newSlotNumber === "string"
    ? newSlotNumber.trim()
    : "";

  if (!Number.isInteger(areaId) || areaId <= 0) {
    throw new Error("Invalid parking area ID");
  }

  if (!/^[A-Za-z0-9-]{1,10}$/.test(number)) {
    throw new Error(
      "Slot number must be 1–10 characters using letters, numbers, or hyphens"
    );
  }

  const request = new sql.Request();

  request.input("areaId", sql.Int, areaId);
  request.input("slotId", sql.VarChar(10), slotId);
  request.input("slotNumber", sql.VarChar(10), number);

  const result = await request.query(`
    UPDATE dbo.Slots
    SET slot_number = @slotNumber
    WHERE area_id = @areaId
      AND slot_id = @slotId
      AND is_active = 1;
  `);

  if (result.rowsAffected[0] === 0) {
    throw new Error("Active slot not found in this parking area");
  }

  logger.info("Parking slot number updated", {
    parkingId: areaId,
    slotId,
    slotNumber: number,
  });

  return {
    parkingId: areaId,
    slotId,
    slotNumber: number,
  };
};

const updateSlotFixedStatus = async (parkingId, slotId, isFixed) => {
  const areaId = Number(parkingId);

  if (!Number.isInteger(areaId) || areaId <= 0) {
    throw new Error("Invalid parking area ID");
  }

  if (typeof isFixed !== "boolean") {
    throw new Error("isFixed must be true or false");
  }

  const request = new sql.Request();

  request.input("areaId", sql.Int, areaId);
  request.input("slotId", sql.VarChar(10), slotId);
  request.input("isFixed", sql.Bit, isFixed);

  const result = await request.query(`
    UPDATE dbo.Slots
    SET is_fixed = @isFixed
    WHERE area_id = @areaId
      AND slot_id = @slotId
      AND is_active = 1;
  `);

  if (result.rowsAffected[0] === 0) {
    throw new Error("Active slot not found in this parking area");
  }

  logger.info("Parking slot type updated", {
    parkingId: areaId,
    slotId,
    isFixed,
  });

  return { parkingId: areaId, slotId, isFixed };
};

const saveLayoutDimensions = async (parkingId, width, height) => {
  // Validate parking area ID
  if (!Number.isInteger(Number(parkingId)) || Number(parkingId) <= 0) {
    throw new Error("Invalid parking area ID");
  }

  // Validate canvas dimensions
  if (
    !Number.isInteger(width) ||
    !Number.isInteger(height) ||
    width < 400 ||
    height < 300 ||
    width > 3000 ||
    height > 2000
  ) {
    throw new Error("Invalid canvas dimensions");
  }

  const request = new sql.Request();

  request.input("areaId", sql.Int, Number(parkingId));
  request.input("width", sql.Int, width);
  request.input("height", sql.Int, height);

  const result = await request.query(`
    UPDATE dbo.Parking_Area
    SET layout_width = @width,
        layout_height = @height
    WHERE area_id = @areaId
      AND is_active = 1;

    IF @@ROWCOUNT = 0
      THROW 50002, 'Parking area not found or inactive', 1;
  `);

  return {
    parkingId: Number(parkingId),
    layoutWidth: width,
    layoutHeight: height
  };
};

const deleteParkingArea = async (parkingId) => {
  const areaId = Number(parkingId);

  if (!Number.isInteger(areaId) || areaId <= 0) {
    throw new Error("Invalid parking area ID");
  }

  const transaction = new sql.Transaction();

  try {
    await transaction.begin();

    const areaRequest = new sql.Request(transaction);
    areaRequest.input("areaId", sql.Int, areaId);

    const areaResult = await areaRequest.query(`
      SELECT area_id
      FROM dbo.Parking_Area WITH (UPDLOCK, HOLDLOCK)
      WHERE area_id = @areaId
    `);

    if (areaResult.recordset.length === 0) {
      throw new Error("Parking area not found");
    }

    // Prevent deletion if a vehicle is currently parked.
    const parkedRequest = new sql.Request(transaction);
    parkedRequest.input("areaId", sql.Int, areaId);

    const parkedResult = await parkedRequest.query(`
      SELECT COUNT(*) AS parkedCount
      FROM dbo.Booking b
      INNER JOIN dbo.Slots s ON s.slot_id = b.slot_id
      WHERE s.area_id = @areaId
        AND b.booking_stat = 1
        AND b.status = 'PARKED'
    `);

    if (parkedResult.recordset[0].parkedCount > 0) {
      throw new Error(
        "Cannot delete this parking area while vehicles are parked"
      );
    }

    // Remove business-trip requests linked to this area's slots.
    const request = new sql.Request(transaction);
    request.input("areaId", sql.Int, areaId);

    await request.query(`
      DELETE br
      FROM dbo.BusinessTripRequest br
      INNER JOIN dbo.Slots s ON s.slot_id = br.slot_id
      WHERE s.area_id = @areaId;
    `);

    // Remove booking audit records before their bookings.
    const auditRequest = new sql.Request(transaction);
    auditRequest.input("areaId", sql.Int, areaId);

    await auditRequest.query(`
      DELETE ba
      FROM dbo.Booking_Audit ba
      INNER JOIN dbo.Booking b
        ON b.booking_id = ba.Booking_ID
      INNER JOIN dbo.Slots s
        ON s.slot_id = b.slot_id
      WHERE s.area_id = @areaId;
    `);

    // Remove bookings associated with this area's slots.
    const bookingRequest = new sql.Request(transaction);
    bookingRequest.input("areaId", sql.Int, areaId);

    await bookingRequest.query(`
      DELETE b
      FROM dbo.Booking b
      INNER JOIN dbo.Slots s
        ON s.slot_id = b.slot_id
      WHERE s.area_id = @areaId;
    `);

    // Remove camera records belonging to the parking area.
    const cameraRequest = new sql.Request(transaction);
    cameraRequest.input("areaId", sql.Int, areaId);

    await cameraRequest.query(`
      DELETE FROM dbo.Camera_Master_Data
      WHERE Area_ID = @areaId;
    `);

    // Remove slots only after their dependent records.
    const slotRequest = new sql.Request(transaction);
    slotRequest.input("areaId", sql.Int, areaId);

    await slotRequest.query(`
      DELETE FROM dbo.Slots
      WHERE area_id = @areaId;
    `);

    // Finally, remove the parking area itself.
    const deleteAreaRequest = new sql.Request(transaction);
    deleteAreaRequest.input("areaId", sql.Int, areaId);

    await deleteAreaRequest.query(`
      DELETE FROM dbo.Parking_Area
      WHERE area_id = @areaId;
    `);

    await transaction.commit();

    logger.info("Parking area deleted", { parkingId: areaId });

    return { parkingId: areaId, deleted: true };
  } catch (error) {
    try {
      await transaction.rollback();
    } catch {
      // Transaction may already have been rolled back.
    }

    throw error;
  }
};

module.exports = { getLayout, saveLayout, generateSlots, deleteSlot, deleteParkingArea, copySlot, restoreSlot, updateSlotNumber, updateSlotFixedStatus, saveLayoutDimensions};