// Import nodemailer for sending emails
const nodemailer = require("nodemailer");

// Create a reusable transporter object using Gmail service
// Credentials are taken from environment variables for security
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false, // true for SSL, false for TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
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
  from: '"EliteSpot Support" <elitespot@daimlertruck.com>',
  to: email,
  subject: "EliteSpot Password Reset | パスワードリセット",

  html: `
  <div style="
      font-family: Arial, Helvetica, sans-serif;
      font-size:16px;
      color:#333;
      line-height:1.6;
  ">
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
    <h2>パスワードリセットのご案内</h2>

    <p>パスワードリセットのリクエストを受け付けました。</p>

    <p>以下のボタンをクリックしてパスワードをリセットしてください。</p>

    <a href="${resetLink}"
       style="display:inline-block;padding:10px 20px;background:#007bff;color:#fff;text-decoration:none;border-radius:5px;">
       パスワードをリセットする
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

const sendReminderEmail = async (email, name, bookingStart) => {
  try {

    const startTime = bookingStart;

    const mailOptions = {
      from: '"EliteSpot Support" <elitespot@daimlertruck.com>',
      to: email,
      subject: "EliteSpot Parking Reminder | 駐車予約リマインダー",

      html: `
      <div style="
          font-family: Arial, Helvetica, sans-serif;
          font-size:16px;
          color:#333;
          line-height:1.6;
      ">
      <h2>EliteSpot Parking Reservation Reminder</h2>

      <p>Hello <b>${name}</b>,</p>

      <p>
        Your parking reservation starts at
        <b>${startTime}</b>. Please park your vehicle within <strong>15 minutes</strong> from the 
        reservation start time.
      </p>

      <p style="color:red;">
        Reservations not occupied within the grace period may be automatically canceled.
      </p>

      <p>
      This is an automated system notification. Please do not reply to this email.
      </p>
      

      <p>
      Regards,<br>
      <strong>EliteSpot Support Team</strong>
      </p>

      <hr style="margin:30px 0;"> 

      <h2>EliteSpot 駐車予約のお知らせ</h2>

      <p><strong>${name}</strong> 様</p>

      <p> いつも EliteSpot をご利用いただき、誠にありがとうございます。</p>

      <p>お客様の駐車予約は 午前<strong>${startTime}</strong>分より開始となります。
      予約開始時刻から<strong>15分以内</strong>にお車を駐車いただきますようお願いいたします。</p>

      <p  style="color:red;">なお、予約時間内に駐車が確認できない場合、予約は自動的にキャンセル
      されることがありますので、あらかじめご了承くださいませ。</p>

      <p>本メールはシステムより自動送信されています。</p>
      <p>恐れ入りますが、本メールへの返信はご遠慮ください。</p>

      <p>今後とも EliteSpot をよろしくお願いいたします。</p>

      <br>

      <p>
      よろしくお願いいたします。<br>
      <strong>EliteSpot サポートチームより</strong>
      </p>
      `
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Reminder email sent to:", email);

  } catch (error) {

    console.error("❌ Reminder Email Error:", error);

    throw error;
  }
};

const sendCancellationEmail = async (email, name, startTime) => {
  try {

    const mailOptions = {
      from: '"EliteSpot Support" <elitespot@daimlertruck.com>',
      to: email,
      subject: "EliteSpot – Parking Reservation Cancellation Notice | EliteSpot 駐車予約キャンセルのお知らせ",

      html: `
      <div style="
          font-family: Arial, Helvetica, sans-serif;
          font-size:16px;
          color:#333;
          line-height:1.6;
      ">
      <h2>EliteSpot – Parking Reservation Cancellation Notice</h2>

      <p>Dear <strong>${name}</strong>,</p>

      <p>
      Your parking reservation for
      <strong>${startTime}</strong> has been automatically cancelled because the vehicle was not parked within the <strong>15-minute grace period.</strong>
      </p>

      <p>
      If parking is still required, please make a new reservation through the EliteSpot application, subject to slot availability.
      </p>
      <p>
        Application Link:
        <a href="https://edgsrv-test.jpadc.corpintra.net/" target="_blank">
          EliteSpot Application
        </a>
      </p>

      <p>
      This is an automated system notification.Please do not reply to this email.
      </p>

      <p>
      Regards,<br>
      <strong>EliteSpot Support Team</strong>
      </p>

      <hr style="margin:30px 0;">

      <h2>EliteSpot 駐車予約キャンセルのお知らせ</h2>

      <p><strong>${name}</strong> 様</p>
      <p>いつも EliteSpot をご利用いただき、誠にありがとうございます。</p>
      <p>ご予約いただいておりました午前<strong>${startTime}</strong>
      開始の駐車予約につきまして、予約開始時刻から<strong>15分以内</strong>にお車の駐車が確認できなかったため、
      自動的にキャンセルされました。</p>

      <p>引き続き駐車をご希望の場合は、駐車スロットの空き状況をご確認のうえ、
      EliteSpotの専用アプリより再度ご予約をお願いいたします。</p>

      <p>
        アプリへのアクセスはこちら： 
        <a href="https://edgsrv-test.jpadc.corpintra.net/" target="_blank">
          EliteSpot Application
        </a>
      </p>

      <p>本メールはシステムより自動送信されています。</p>
      <p>恐れ入りますが、本メールへの返信はご遠慮ください。</p>

      <p>今後とも EliteSpot をよろしくお願いいたします。</p>

      <br>

      <p>
      よろしくお願いいたします。<br>
      <strong>EliteSpot サポートチームより</strong>
      </p>
      `
    };

    await transporter.sendMail(mailOptions);

    console.log("✅ Cancellation email sent to:", email);

  } catch (error) {

    console.error("❌ Cancellation email error:", error);

    throw error;
  }
};

// Export function
module.exports = {
  sendResetEmail,
  sendReminderEmail,
  sendCancellationEmail,
};