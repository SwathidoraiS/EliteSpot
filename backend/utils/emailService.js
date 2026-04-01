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
      from: `"EliteSpot Support" <${process.env.EMAIL_USER}>`, // Better sender format
      to: email,
      subject: "EliteSpot Password Reset",
      
      // HTML email content
      html: `
        <h3>Password Reset Request</h3>
        <p>You requested to reset your password.</p>
        <p>Click the button below to reset your password:</p>

        <a href="${resetLink}" 
           style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
           Reset Password
        </a>

        <p>If you did not request this, please ignore this email.</p>
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