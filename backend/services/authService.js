const { sql } = require("../config/db");
const { decrypt } = require("../utils/encryption");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendResetEmail = require("../utils/emailService");
const bcrypt = require("bcryptjs");
const BASE_URL = process.env.FRONTEND_BASE_URL;

//First time Login
exports.login = async ({ username, password }) => {

  let user;

  // Detect Email login
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);

if (isEmail) {

    const result = await sql.query`
      SELECT * FROM Users
      WHERE Email = ${username}
      AND is_active = 1
    `;

    if (result.recordset.length === 0) {
      throw new Error("Email not found");
    }

    user = result.recordset[0];

    if (!user.password_created) {
      throw new Error("Please login using Employee ID and default password");
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash.toString()
    );

    if (!validPassword) {
      throw new Error("Wrong password");
    }

  }

  // EmpID login
else {

  const result = await sql.query`
    SELECT * FROM Users
    WHERE Emp_id = ${username}
    AND is_active = 1
  `;

  if (result.recordset.length === 0) {
    throw new Error("Employee not found");
  }

  user = result.recordset[0];

  console.log("LOGIN CHECK → password_created:", user.password_created);

  // 🔥 AFTER RESET → use bcrypt
  if (user.password_created) {

    if (!user.password_hash) {
      throw new Error("Password not set. Please reset your password.");
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash.toString()
    );

    if (!validPassword) {
      throw new Error("Wrong password");
    }

  } 

  // 🔥 FIRST TIME LOGIN → use default password
  else {

    let decryptedDOB;

// ✅ Only decrypt if it looks encrypted
if (typeof user.dob === "string" && user.dob.includes(":")) {
  try {
    decryptedDOB = decrypt(user.dob);
  } catch (err) {
    console.log("❌ Decrypt failed, fallback to raw DOB");
    decryptedDOB = user.dob;
  }
} else {
  // plain DOB
  decryptedDOB = user.dob;
}

const dob = new Date(decryptedDOB);

// 🔥 safety check
if (isNaN(dob.getTime())) {
  throw new Error("Invalid DOB data. Contact admin.");
}

    const year = dob.getFullYear();
    const expectedPassword = user.Emp_id + year;

    if (password !== expectedPassword) {
      throw new Error("Wrong password");
    }

  }

}
  // Generate token
  const token = jwt.sign(

  { 
    user_id: user.user_id,
    Emp_id: user.Emp_id,
    role: user.role   // 🔥 ADD THIS
  },
  process.env.JWT_SECRET,
  { expiresIn: "24h" }
);

  return {
    user,
    token
  };

};


//Forget password 

exports.forgotPassword = async (email, req) => {

  const ip = req.ip || req.headers['x-forwarded-for'] || 'Unknown';

  const result = await sql.query`
    SELECT * FROM Users WHERE Email = ${email}
  `;

  // Log attempt even if email does not exist
  await sql.query`
    INSERT INTO forgot_password_logs (email, requested_at, ip_address)
    VALUES (${email}, GETDATE(), ${ip})
  `;

  if (result.recordset.length === 0) {
    throw new Error("Email not found");
  }

  const user = result.recordset[0];

  const token = crypto.randomBytes(32).toString("hex");

  const expires = new Date(Date.now() + 3600000); // 1 hour

  await sql.query`
    INSERT INTO Password_Reset_Tokens (user_id, email, reset_token, expires_at)
    VALUES (${user.user_id}, ${email}, ${token}, ${expires})
  `;

  const resetLink = `${process.env.FRONTEND_BASE_URL}/reset-password/${token}`; 

  await sendResetEmail(email, resetLink);

  return { message: "Reset email sent" };
};

//Reset Password
exports.resetPassword = async (token, newPassword) => {

  const result = await sql.query`
    SELECT *
    FROM Password_Reset_Tokens
    WHERE reset_token = ${token}
    AND used = 0
  `;

  if (result.recordset.length === 0) {
    throw new Error("Invalid reset token");
  }

  // ✅ define reset FIRST
  const reset = result.recordset[0];

  console.log("RESET RECORD:", reset);

  // Check expiration
  const now = new Date();

  if (now > reset.expires_at) {
    throw new Error("Reset link expired. Please request again.");
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // ✅ DEFINE updateResult properly
  const updateResult = await sql.query`
    UPDATE Users
    SET password_hash = ${hashedPassword},
        password_created = 1
     WHERE user_id = ${reset.user_id}
  `;

  console.log("Rows updated:", updateResult.rowsAffected);

  // Mark token as used
  await sql.query`
    UPDATE Password_Reset_Tokens
    SET used = 1
    WHERE reset_token = ${token}
  `;

  return { message: "Password reset successful" };
};

exports.verifyResetToken = async (token) => {

  const result = await sql.query`
    SELECT *
    FROM Password_Reset_Tokens
    WHERE reset_token = ${token}
    AND used = 0
  `;

  if (result.recordset.length === 0) {
    throw new Error("Invalid reset link");
  }

  const reset = result.recordset[0];

  const now = new Date();

  if (now > reset.expires_at) {
    throw new Error("Reset link expired");
  }

  return { message: "Valid token" };
};
