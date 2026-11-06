const { sql } = require("../config/db");
const { encrypt, decrypt } = require("../utils/encryption");
const logger = require("../utils/logger");
/**
 * 👤 Get all users
 * - Decrypts DOB before returning
 */
exports.getAllUsers = async () => {
  
  const result = await sql.query(`SELECT * FROM Users`);

  const users = result.recordset.map((user) => {
    let dobValue = user.dob;

    // 🔐 Decrypt DOB safely
    try {
      dobValue = decrypt(user.dob);
    } catch {
      // silently fail (avoid logging sensitive data)
    }

    return {
      ...user,
      dob: dobValue,
    };
  });

  return users;
};

/**
 * ➕ Add new user
 * - Converts DOB format
 * - Encrypts DOB before storing
 */
exports.addUser = async (user) => {

  logger.info("Creating new user", {
      Emp_id: user.Emp_id,
      Email: user.Email
  });

  let encryptedDOB = null;

if (user.dob && user.dob.trim() !== "") {
    // Convert DD.MM.YYYY → YYYY-MM-DD
    const [day, month, year] = user.dob.split(".");
    const formattedDob = `${year}-${month}-${day}`;

    const dob = new Date(formattedDob);

    if (isNaN(dob.getTime())) {
        throw new Error("Invalid DOB format");
    }

    encryptedDOB = encrypt(dob.toISOString());
}

  await sql.query`
    INSERT INTO Users 
    (Emp_id, first_name, last_name, Email, dob, is_active, car_plate, role)
    VALUES 
    (${user.Emp_id?.trim() || null}, ${user.first_name}, ${user.last_name}, ${user.Email}, ${encryptedDOB}, 1, ${user.car_plate}, ${user.role})
  `;

  logger.info("User created successfully", {
      Emp_id: user.Emp_id,
      Email: user.Email
  });
};

/**
 * ✏️ Update user
 * - Encrypts DOB before updating
 * - Keeps Emp_id as NULL when empty
 * - Keeps existing DOB when no DOB is provided
 */
exports.updateUser = async (id, user) => {
  logger.info("Updating user", {
    userId: id,
    Emp_id: user.Emp_id,
    Email: user.Email
  });

  // 👤 Convert empty Emp_id to NULL
  const empId = user.Emp_id?.trim() || null;

  // 🔐 Handle DOB safely
  let encryptedDOB = null;

  if (user.dob && user.dob.trim() !== "") {
    const dob = new Date(user.dob);

    if (isNaN(dob.getTime())) {
      throw new Error("Invalid DOB");
    }

    encryptedDOB = encrypt(dob.toISOString());
  }

  if (encryptedDOB) {
    // DOB is provided → update DOB
    await sql.query`
      UPDATE Users
      SET 
        Emp_id = ${empId},
        first_name = ${user.first_name},
        last_name = ${user.last_name},
        Email = ${user.Email},
        dob = ${encryptedDOB},
        is_active = ${Number(user.is_active)},
        car_plate = ${user.car_plate},
        role = ${user.role}
      WHERE user_id = ${id}
    `;
  } else {
    // DOB is empty → keep existing DOB
    await sql.query`
      UPDATE Users
      SET 
        Emp_id = ${empId},
        first_name = ${user.first_name},
        last_name = ${user.last_name},
        Email = ${user.Email},
        is_active = ${Number(user.is_active)},
        car_plate = ${user.car_plate},
        role = ${user.role}
      WHERE user_id = ${id}
    `;
  }

  logger.info("User updated successfully", {
    userId: id,
    Emp_id: empId
  });
};

/**
 * ❌ Soft delete user
 * - Marks user as inactive
 */
exports.deleteUser = async (id) => {
  logger.info("Deactivating user", {
      userId: id
  });
  await sql.query`
    UPDATE Users
    SET is_active = 0
    WHERE user_id = ${id}
  `;

  logger.info("User deactivated successfully", {
      userId: id
  });
};

/**
 * ✏️ Update own first and last name
 */
exports.updateOwnName = async (user_id, first_name, last_name) => {

  const result = await sql.query`
    UPDATE Users
    SET
      first_name = ${first_name},
      last_name = ${last_name}
    OUTPUT
      INSERTED.first_name,
      INSERTED.last_name
    WHERE user_id = ${user_id}
      AND is_active = 1
  `;

  if (result.recordset.length === 0) {
    throw new Error("User not found or inactive");
  }

  logger.info("User updated their name", {
    userId: user_id
  });

  return result.recordset[0];
};