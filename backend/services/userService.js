const { sql } = require("../config/db");

// Get all users
exports.getAllUsers = async () => {
  const result = await sql.query(`
    SELECT * FROM Users
  `);

  return result.recordset;
};

// Add user
exports.addUser = async (user) => {
  await sql.query(`
    INSERT INTO Users (Emp_id, first_name, last_name, Email, is_active)
    VALUES ('${user.Emp_id}', '${user.first_name}', '${user.last_name}', '${user.Email}', 1)
  `);
};

// Update user
exports.updateUser = async (id, user) => {
  await sql.query(`
    UPDATE Users
    SET 
      Emp_id='${user.Emp_id}',
      first_name='${user.first_name}',
      last_name='${user.last_name}',
      Email='${user.Email}',
      is_active=${Number(user.is_active)}
    WHERE user_id=${id}
  `);
};
// Delete user
exports.deleteUser = async (id) => {
  await sql.query(`
    UPDATE Users
    SET is_active = 0
    WHERE user_id = ${id}
  `);
};