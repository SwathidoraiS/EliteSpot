const { sql } = require("../config/db");
const { decrypt } = require("../utils/encryption");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const sendResetEmail = require("../utils/emailService");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/AppError");

const BASE_URL = process.env.FRONTEND_BASE_URL;

//First time Login
exports.login = async ({ username, password }) => {

    // 🔥 Input validation
  if (!username || !password) {
    throw new AppError(
      "Username and password are required",
      400
    );
  }

  // 🔥 Trim spaces
  username = username.trim();
  password = password.trim();

  let user;

  // Detect Email login
  const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(username);

  // ================= EMAIL LOGIN =================
  if (isEmail) {

    const result = await sql.query`
      SELECT * FROM Users
      WHERE Email = ${username}
      AND is_active = 1
    `;

    if (result.recordset.length === 0) {
      throw new AppError("Invalid credentials", 401);
    }

    user = result.recordset[0];

    // 🔒 Check account lock
if (
  user.lock_until &&
  new Date(user.lock_until) > new Date()
) {
  const remainingMinutes = Math.ceil(
    (new Date(user.lock_until) - new Date()) / 60000
  );

  throw new AppError(
    `Account locked. Try again after ${remainingMinutes} minute(s).`,
    403
  );
}

    if (!user.password_created) {
      throw new Error("Please login using Employee ID and default password");
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash.toString()
    );

if (!validPassword) {

  const attempts = (user.failed_attempts || 0) + 1;

  // 🔒 Lock after 3 attempts
  if (attempts >= 3) {

    const lockUntil = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await sql.query`
      UPDATE Users
      SET failed_attempts = 0,
          lock_until = ${lockUntil}
      WHERE user_id = ${user.user_id}
    `;

    throw new AppError(
      "Account locked for 15 minutes due to multiple failed attempts.",
      403
    );
  }

  // 🔥 Update failed attempts
  await sql.query`
    UPDATE Users
    SET failed_attempts = ${attempts}
    WHERE user_id = ${user.user_id}
  `;

  throw new AppError(
    `Invalid credentials. ${
      3 - attempts
    } attempt(s) remaining.`,
    401
  );
}
  }

  // ================= EMPLOYEE ID LOGIN =================
  else {

  const result = await sql.query`
    SELECT * FROM Users
    WHERE Emp_id = ${username}
    AND is_active = 1
  `;

  if (result.recordset.length === 0) {
    throw new AppError("Invalid credentials", 401);
  }

  user = result.recordset[0];

  // 🔒 Check account lock
if (
  user.lock_until &&
  new Date(user.lock_until) > new Date()
) {
  const remainingMinutes = Math.ceil(
    (new Date(user.lock_until) - new Date()) / 60000
  );

  throw new AppError(
    `Account locked. Try again after ${remainingMinutes} minute(s).`,
    403
  );
}

  // 🔥 AFTER RESET → use bcrypt
  if (user.password_created) {

    if (!user.password_hash) {
      throw new AppError("Password not set. Please reset your password.",400);
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash.toString()
    );

if (!validPassword) {

  const attempts = (user.failed_attempts || 0) + 1;

  // 🔒 Lock after 3 attempts
  if (attempts >= 3) {

    const lockUntil = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await sql.query`
      UPDATE Users
      SET failed_attempts = 0,
          lock_until = ${lockUntil}
      WHERE user_id = ${user.user_id}
    `;

    throw new AppError(
      "Account locked for 15 minutes due to multiple failed attempts.",
      403
    );
  }

  // 🔥 Update failed attempts
  await sql.query`
    UPDATE Users
    SET failed_attempts = ${attempts}
    WHERE user_id = ${user.user_id}
  `;

  throw new AppError(
    `Invalid credentials. ${
      3 - attempts
    } attempt(s) remaining.`,
    401
  );
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
  throw new AppError("Invalid DOB data. Contact admin.",500);
}

    const year = dob.getFullYear();
    const expectedPassword = user.Emp_id + year;

    if (password !== expectedPassword) {

  const attempts = (user.failed_attempts || 0) + 1;

  // 🔒 Lock after 3 attempts
  if (attempts >= 3) {

    const lockUntil = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await sql.query`
      UPDATE Users
      SET failed_attempts = 0,
          lock_until = ${lockUntil}
      WHERE user_id = ${user.user_id}
    `;

    throw new AppError(
      "Account locked for 15 minutes due to multiple failed attempts.",
      403
    );
  }

  // 🔥 Update failed attempts
  await sql.query`
    UPDATE Users
    SET failed_attempts = ${attempts}
    WHERE user_id = ${user.user_id}
  `;

  throw new AppError(
    `Invalid credentials. ${
      3 - attempts
    } attempt(s) remaining.`,
    401
  );
}

  }

}

// ✅ Reset failed attempts after successful login
await sql.query`
  UPDATE Users
  SET failed_attempts = 0,
      lock_until = NULL
  WHERE user_id = ${user.user_id}
`;
  // Generate token
  const token = jwt.sign(

  { 
    user_id: user.user_id,
    Emp_id: user.Emp_id,
    role: user.role   // 🔥 ADD THIS
  },
  process.env.JWT_SECRET,
  { issuer: "EliteSpot",
    expiresIn: "24h" }
);

    const safeUser = {
      user_id: user.user_id,
      Emp_id: user.Emp_id,
      Email: user.Email,
      role: user.role,
      first_name: user.first_name,
      last_name: user.last_name,
      full_name: `${user.first_name} ${user.last_name}`
    };

  return {
  user: safeUser,
  token
};

};


//Forget password 

exports.forgotPassword = async (email, req) => {

  const ip = req.ip || req.headers['x-forwarded-for'] || 'Unknown';

  if (!email) {
  throw new AppError("Email is required", 400);
}

  const result = await sql.query`
    SELECT * FROM Users WHERE Email = ${email}
  `;

  // Log attempt even if email does not exist
  await sql.query`
    INSERT INTO forgot_password_logs (email, requested_at, ip_address)
    VALUES (${email}, GETDATE(), ${ip})
  `;

  if (result.recordset.length === 0) {

    return {
      message:
        "If the email exists, a reset link has been sent"
    };

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

  if (!token || !newPassword) {
  throw new AppError(
    "Token and password are required",
    400
  );
}

  const result = await sql.query`
    SELECT *
    FROM Password_Reset_Tokens
    WHERE reset_token = ${token}
    AND used = 0
  `;

  if (result.recordset.length === 0) {
    throw new AppError("Invalid reset token", 400);
  }

  // ✅ define reset FIRST
  const reset = result.recordset[0];

  // Check expiration
  const now = new Date();

  if (now > reset.expires_at) {
    throw new AppError(
      "Reset link expired. Please request again.",
      400
    );
  }
  
  // 🔥 PASSWORD VALIDATION
  const strongPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (!strongPassword.test(newPassword)) {
    throw new AppError(
      "Password must contain uppercase, lowercase, number, special character and minimum 8 characters",400
    );
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
    throw new AppError("Invalid reset link", 400);
  }

  const reset = result.recordset[0];

  const now = new Date();

  if (now > reset.expires_at) {
    throw new AppError(
      "Reset link expired. Please request again.",
      400
    );
  }

  return { message: "Valid token" };
};
