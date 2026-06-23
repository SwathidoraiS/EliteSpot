// Import nodemailer for sending emails
const nodemailer = require("nodemailer");

// Create a reusable transporter object using Gmail service
// Credentials are taken from environment variables for security
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Sender email
    pass: process.env.EMAIL_PASS  // App password (NOT normal Gmail password)
  }
});

/**
 * Sends password reset email to the user
 * @param {string} email - Recipient email address
 * @param {string} resetLink - Password reset URL
 */
const sendResetEmail = async (email, resetLink) => {
  try {
    // Email configuration
    const mailOptions = {
  from: `"EliteSpot Support" <${process.env.EMAIL_USER}>`,
  to: email,
  subject: "EliteSpot Password Reset | パスワード再設定",

  html: `
    <!-- English Version -->
    <h2>Password Reset Request</h2>

    <p>You requested to reset your password.</p>

    <p>Click the button below to reset your password:</p>

    <a href="${resetLink}"
       style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
       Reset Password
    </a>

    <p>This link will expire in 15 minutes.</p>

    <p>If you did not request this password reset, please ignore this email.</p>

    <p>
      Regards,<br>
      EliteSpot Support Team
    </p>

    <hr style="margin:30px 0;">

    <!-- Japanese Version -->
    <h2>パスワード再設定のご案内</h2>

    <p>パスワード再設定のリクエストを受け付けました。</p>

    <p>以下のボタンをクリックしてパスワードを再設定してください。</p>

    <a href="${resetLink}"
       style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
       パスワードを再設定する
    </a>

    <p>このリンクの有効期限は15分です。</p>

    <p>このリクエストに心当たりがない場合は、このメールを無視してください。</p>

    <p>
      よろしくお願いいたします。<br>
      EliteSpot サポートチーム
    </p>
  `
};

    // Send email
    await transporter.sendMail(mailOptions);

    console.log("✅ Reset email sent to:", email);

  } catch (error) {
    console.error("❌ Error sending reset email:", error.message);
    throw new Error("Failed to send reset email");
  }
};

// Export function
module.exports = sendResetEmail;