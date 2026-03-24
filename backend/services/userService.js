const { sql } = require("../config/db");
const { encrypt, decrypt } = require("../utils/encryption");

// Get all users
exports.getAllUsers = async () => {

  const result = await sql.query(`SELECT * FROM Users`);

  const users = result.recordset.map(user => {

    let dobValue = user.dob;

    try {
      dobValue = decrypt(user.dob);
    } catch (err) {
      console.log("DOB decrypt error:", err.message);
    }

    return {
      ...user,
      dob: dobValue,
      car_plate: user.car_plate,
      role: user.role
    };
  });

  return users;
};

// Add user
exports.addUser = async (user) => {

  // convert DD.MM.YYYY → YYYY-MM-DD
  const [day, month, year] = user.dob.split(".");
  const formattedDob = `${year}-${month}-${day}`;

  const dob = new Date(formattedDob);

  // 🔐 Encrypt DOB
  const encryptedDOB = encrypt(dob.toISOString());

  await sql.query`
    INSERT INTO Users 
    (Emp_id, first_name, last_name, Email, dob, is_active, car_plate, role)
    VALUES 
    (${user.Emp_id}, ${user.first_name}, ${user.last_name}, ${user.Email}, ${encryptedDOB}, 1, ${user.car_plate}, ${user.role})
  `;

  console.log("USER DATA:", user);
};

// Update user
exports.updateUser = async (id, user) => {

  const dob = new Date(user.dob);

  // 🔐 Encrypt DOB
  const encryptedDOB = encrypt(dob.toISOString());

  await sql.query`
    UPDATE Users
    SET 
      Emp_id=${user.Emp_id},
      first_name=${user.first_name},
      last_name=${user.last_name},
      Email=${user.Email},
      dob=${encryptedDOB},
      is_active=${Number(user.is_active)},
      car_plate=${user.car_plate},
      role=${user.role}
    WHERE user_id=${id}
  `;
};

// Delete user (soft delete)
exports.deleteUser = async (id) => {
  await sql.query(`
    UPDATE Users
    SET is_active = 0
    WHERE user_id = ${id}
  `);
};