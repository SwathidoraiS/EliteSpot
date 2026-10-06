const { sql } = require("../config/db");
const { decrypt } = require("../utils/encryption");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { sendResetEmail } = require("../utils/emailService");
const bcrypt = require("bcryptjs");
const AppError = require("../utils/AppError");
const logger = require("../utils/logger");
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
  logger.info("Login attempt", {
      username,
      loginType: isEmail ? "EMAIL" : "EMPLOYEE_ID"
  });
  // ================= EMAIL LOGIN =================
  if (isEmail) {

        const normalizedUsername = username.trim().toLowerCase();

    const archionUsername = normalizedUsername.replace(
      "@daimlertruck.com",
      "@archion-group.com"
    );

    const daimlerUsername = normalizedUsername.replace(
      "@archion-group.com",
      "@daimlertruck.com"
    );

    const result = await sql.query`
      SELECT * FROM Users 
      WHERE (
        LOWER(Email) = ${normalizedUsername}
        OR LOWER(Email) = ${archionUsername}
        OR LOWER(Email) = ${daimlerUsername}
      )
      AND is_active = 1
    `;

    if (result.recordset.length === 0) {
      logger.warn("Login failed - User not found", {
          username
      });
      throw new AppError("Invalid credentials", 401);
    }

    user = result.recordset[0];


    if (!user.password_created) {
      throw new Error("Please login using Employee ID and default password");
    }

    if (!user.password_hash) {
      throw new AppError(
        "Password not set. Please reset your password.",
        400
      );
    }

    const validPassword = await bcrypt.compare(
      password,
      user.password_hash.toString()
    );

    if (!validPassword) {

      logger.warn("Login failed - Invalid password", {
          username
      });
      throw new AppError(
        "Invalid credentials.",
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

    logger.warn("Login failed - User not found", {
        username
    });

    throw new AppError("Invalid credentials", 401);
  }

  user = result.recordset[0];


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
         logger.warn("Login failed - Invalid password", {
          username
        });

        throw new AppError(
          "Invalid credentials.",
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
        logger.error("DOB decryption failed", {
            username,
            error: err.message
        });
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
      logger.warn("First time login failed - Invalid default password", {
        username
      });

      throw new AppError(
        "Invalid credentials.",
        401
      );
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
  { issuer: "EliteSpot",
    expiresIn: "30d" }
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

    logger.info("Login successful", {
        userId: user.user_id,
        empId: user.Emp_id,
        email: user.Email,
        role: user.role,
        loginType: isEmail ? "EMAIL" : "EMPLOYEE_ID"
    });

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

  let normalizedEmail = email.trim().toLowerCase();

  logger.info("Forgot password requested", {
      email: normalizedEmail,
      ip
  });

 const archionEmail = normalizedEmail.replace(
  "@daimlertruck.com",
  "@archion-group.com"
);

const daimlerEmail = normalizedEmail.replace(
  "@archion-group.com",
  "@daimlertruck.com"
);

const result = await sql.query`
  SELECT *
  FROM Users
  WHERE LOWER(Email) = ${normalizedEmail}
     OR LOWER(Email) = ${archionEmail}
     OR LOWER(Email) = ${daimlerEmail}
`;

  // Log attempt even if email does not exist
  await sql.query`
    INSERT INTO forgot_password_logs (email, requested_at, ip_address)
    VALUES (${normalizedEmail}, GETDATE(), ${ip})
  `;

  if (result.recordset.length === 0) {

    logger.warn("Forgot password failed - Email not registered", {
        email: normalizedEmail,
        ip
    });

    throw new AppError(
      "Email is not registered.",
      404
    );
  }

  const user = result.recordset[0];

  const token = crypto.randomBytes(32).toString("hex");

  const expires = new Date(Date.now() + 15 * 60 * 1000); // 1 hour

  await sql.query`
    INSERT INTO Password_Reset_Tokens (user_id, email, reset_token, expires_at)
    VALUES (${user.user_id}, ${normalizedEmail}, ${token}, ${expires})
  `;

  const resetLink = `${process.env.FRONTEND_BASE_URL}/reset-password/${token}`; 

  await sendResetEmail(normalizedEmail, resetLink);

  logger.info("Password reset email sent", {
      userId: user.user_id,
      email: normalizedEmail
  });

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

  logger.warn("Reset password failed - Invalid token", {
      token: token.substring(0, 8) + "..."
  });

  // ✅ define reset FIRST
  const reset = result.recordset[0];

  // Check expiration
  const now = new Date();

  if (now > reset.expires_at) {

    logger.warn("Reset password failed - Token expired", {
        userId: reset.user_id
    });

    throw new AppError(
      "Reset link expired. Please request again.",
      400
    );
  }
  
  // 🔥 PASSWORD VALIDATION
  const strongPassword =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

  if (!strongPassword.test(newPassword)) {

    logger.warn("Reset password failed - Weak password", {
        userId: reset.user_id
    });

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

  logger.info("Password updated successfully", {
      userId: reset.user_id
  });

  // Mark token as used
  await sql.query`
    UPDATE Password_Reset_Tokens
    SET used = 1
    WHERE reset_token = ${token}
  `;

  logger.info("Reset token marked as used", {
      userId: reset.user_id
  });

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
    logger.warn("Reset token verification failed - Invalid token", {
        token: token.substring(0, 8) + "..."
    });
    throw new AppError("Invalid reset link", 400);
  }

  const reset = result.recordset[0];

  const now = new Date();

  if (now > reset.expires_at) {
    logger.warn("Reset token verification failed - Token expired", {
        userId: reset.user_id
    });
    throw new AppError(
      "Reset link expired. Please request again.",
      400
    );
  }
  logger.info("Reset token verified successfully", {
      userId: reset.user_id
  });

  return { message: "Valid token" };
};
