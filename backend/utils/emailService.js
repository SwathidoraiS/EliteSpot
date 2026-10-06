// Import nodemailer for sending emails
const nodemailer = require("nodemailer");
const logger = require("../utils/logger");
const formatJapanDateTime = (dateTime) => {
 if (!dateTime) return "--";
 const date = new Date(dateTime);
 const year = date.getUTCFullYear();
 const month = String(date.getUTCMonth() + 1).padStart(2, "0");
 const day = String(date.getUTCDate()).padStart(2, "0");
 const hours = String(date.getUTCHours()).padStart(2, "0");
 const minutes = String(date.getUTCMinutes()).padStart(2, "0");
 return `${year}-${month}-${day} ${hours}:${minutes}`;
};
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

    logger.info("Reset email sent successfully", {
      email
    });

  } catch (error) {
    logger.error("Error sending reset email", {
      email,
      error: error.message,
      stack: error.stack
    });
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

      <p>Dear <b>${name}</b>,</p>

      <p>
        Your parking reservation starts at
        <b>${startTime}</b>. Please park your vehicle within <strong>30 minutes</strong> from the 
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
      予約開始時刻から<strong>30分以内</strong>にお車を駐車いただきますようお願いいたします。</p>

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

    logger.info("Reminder email sent successfully", {
      email,
      name,
      bookingStart
    });

  } catch (error) {

    logger.error("Reminder email error", {
      email,
      name,
      bookingStart,
      error: error.message,
      stack: error.stack
    });

    throw error;
  }
};

const sendParkingReminderEmail = async (
  email,
  name,
  startTime
) => {
  try {
    await transporter.sendMail({
      from: '"EliteSpot Support" <elitespot@daimlertruck.com>',
      to: email,
      subject: "Reminder: Please Park Your Car / 駐車のリマインダー",
      html: `
        <h2>EliteSpot Parking Reservation Reminder</h2>

        <p>Dear <strong>${name}</strong>,</p>

        <p>
          Your parking booking started at
          <strong>${startTime}</strong>.
        </p>

        <p>
          We noticed that your car has not been parked yet.
          Please park your car as soon as possible.
        </p>

        <p>
          If your car is not parked within 30 minutes of the
          booking start time, your booking will be automatically cancelled.
        </p>

        <p>
        Regards,<br>
        <strong>EliteSpot Support Team</strong>
        </p>

        <hr style="margin:30px 0;">

        <h2>EliteSpot 駐車予約キャンセルのお知らせ</h2>

        <p><strong>${name}</strong> 様</p>

        <p> いつも EliteSpot をご利用いただき、誠にありがとうございます。</p>

        <p>
          ${startTime} に駐車予約が開始されました。
        </p>

        <p>
          現在、お車がまだ駐車されていません。
          お早めに駐車してください。
        </p>

        <p>
          予約開始時間から30分以内に駐車されない場合、
          予約は自動的にキャンセルされます。
        </p>

        <p>
        よろしくお願いいたします。<br>
        <strong>EliteSpot サポートチームより</strong>
        </p>
      `
    });

    logger.info("Parking reminder email sent", {
      email,
      startTime
    });

  } catch (error) {
    logger.error("Failed to send parking reminder email", {
      email,
      error: error.message
    });

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
      <strong>${startTime}</strong> has been automatically cancelled because the vehicle was not parked within the <strong>30-minute grace period.</strong>
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
      開始の駐車予約につきまして、予約開始時刻から<strong>30分以内</strong>にお車の駐車が確認できなかったため、
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

    logger.info("Cancellation email sent successfully", {
      email,
      name,
      startTime
    });

  } catch (error) {

    logger.error("Cancellation email error", {
      email,
      name,
      startTime,
      error: error.message,
      stack: error.stack
    });

    throw error;
  }
};

const sendDailyFeedbackSummaryEmail = async (
  email,
  adminName,
  feedbackList,
  summaryDate
) => {

  try {

    const totalFeedback = feedbackList.length;

    const feedbackHtml = feedbackList.map((feedback, index) => {

      const formattedDate = new Date(feedback.created_at)
        .toLocaleString("ja-JP", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",

        });

      return `
        <div style="
          margin-bottom: 20px;
          padding: 15px;
          border: 1px solid #ddd;
          border-radius: 8px;
        ">

          <p>
            <strong>Feedback ${index + 1}</strong>
          </p>

          <p>
            <strong>Rating:</strong> ${feedback.rating}/5
          </p>

          <p>
            <strong>Message:</strong><br>
            ${feedback.message}
          </p>

          <p>
            <strong>Submitted:</strong> ${formattedDate}
          </p>

        </div>
      `;
    }).join("");

    await transporter.sendMail({
      from: '"EliteSpot Support" <elitespot@daimlertruck.com>',
      to: email,

      subject:
        `EliteSpot - Daily Feedback Summary / 日次フィードバックサマリー - ${summaryDate}`,

      html: `
        <!DOCTYPE html>
        <html>
        <body style="
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
        ">

          <h2>EliteSpot - Daily Feedback Summary</h2>

          <p>Hello ${adminName},</p>

          <p>
            You have received
            <strong>${totalFeedback} feedback submission(s)</strong>
            today.
          </p>

          <p>
            Please review the feedback and take any necessary action.
          </p>

          <hr>

          <h2>日次フィードバックサマリー</h2>

          <p>${adminName} 様</p>

          <p>
            本日は
            <strong>${totalFeedback}件</strong>
            のフィードバックが届いています。
          </p>

          <p>
            内容をご確認いただき、必要に応じて対応をお願いいたします。
          </p>

          <hr>

          <h3>Feedback Details / フィードバック詳細</h3>

          ${feedbackHtml}

          <hr>

          <p>
            Thank you,<br>
            EliteSpot
          </p>

        </body>
        </html>
      `
    });

  } catch (error) {

    logger.error("Failed to send daily feedback summary email", {
      email,
      error: error.message
    });

    throw error;
  }
};

/**
* Sends Business Trip approval request email to Admin / HR
*/
const sendBusinessTripRequestEmail = async ({
  recipientEmail,
  employeeName,
  employeeId,
  slotId,
  bookingStart,
  bookingEnd,
  purpose,
  requestId
}) => {
  try {
    const mailOptions = {
      from: '"EliteSpot Support" <elitespot@daimlertruck.com>',
      to: recipientEmail,
      subject: `Multiple Day Car SParking Approval Request - ${employeeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto;">
        <h2 style="color: #095e6d;">
          Multiple Day Car Parking Approval Request
        </h2>
        <p>
          A new parking request has been submitted
          and requires your approval.
        </p>
        <hr />
        <h3>Request Details</h3>
        <table style="border-collapse: collapse; width: 100%;">
        <tr>
        <td style="padding: 8px; font-weight: bold;">Employee Name</td>
        <td style="padding: 8px;">${employeeName}</td>
        </tr>
        <tr>
        <td style="padding: 8px; font-weight: bold;">Employee ID</td>
        <td style="padding: 8px;">${employeeId}</td>
        </tr>
        <tr>
        <td style="padding: 8px; font-weight: bold;">Parking Slot</td>
        <td style="padding: 8px;">${slotId}</td>
        </tr>
        <tr>
        <td style="padding: 8px; font-weight: bold;">From</td>
        <td style="padding: 8px;">${bookingStart}</td>
        </tr>
        <tr>
        <td style="padding: 8px; font-weight: bold;">To</td>
        <td style="padding: 8px;">${bookingEnd}</td>
        </tr>
        <tr>
        <td style="padding: 8px; font-weight: bold;">Purpose</td>
        <td style="padding: 8px;">${purpose}</td>
        </tr>
        </table>
        <br />
        <p>
           Please review this request and take the appropriate action
           from the approval screen.
        </p>
        <p>
        Application Link:
        <a href="https://edgsrv-test.jpadc.corpintra.net/" target="_blank">
          EliteSpot Application
        </a>
        </p>
        <hr />
        <p style="font-size: 12px; color: #777;">
           This is an automated email from the EliteSpot.
        </p>
        </div>
        `
    };
    await transporter.sendMail(mailOptions);
    logger.info("Multiple day Car Parking approval email sent", {
      recipientEmail,
      requestId
    });
    return true;
  } catch (error) {
    logger.error("Failed to send Multiple day Car Parking  approval email", {
      recipientEmail,
      requestId,
      error: error.message
    });
    throw error;
  }
};

const sendBusinessTripApprovalEmail = async ({
  recipientEmail,
  employeeName,
  slotId,
  bookingStart,
  bookingEnd,
  purpose,
  requestId
}) => {
  try {
    const mailOptions = {
      from: '"EliteSpot Support" <elitespot@daimlertruck.com>',
      to: recipientEmail,
      subject: `Muliple Day Parking Request Approved - ${employeeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto;">
        <h2 style="color: #095e6d;">
           Multiple Day Car Parking Request Approved
        </h2>
        <p>
           Your Multiple Day Car parking request has been
        <strong style="color: #16a34a;">approved</strong>.
        </p>
        <hr />
        <h3>Request Details</h3>
        <table style="border-collapse: collapse; width: 100%;">
        <tr>
        <td style="padding: 8px; font-weight: bold;">Employee Name</td>
        <td style="padding: 8px;">${employeeName}</td>
        </tr>
        <tr>
        <td style="padding: 8px; font-weight: bold;">Parking Slot</td>
        <td style="padding: 8px;">${slotId}</td>
        </tr>
        <tr>
        <td style="padding: 8px; font-weight: bold;">From</td>
        <td style="padding: 8px;">${formatJapanDateTime(bookingStart)}</td>
        </tr>
        <tr>
        <td style="padding: 8px; font-weight: bold;">To</td>
        <td style="padding: 8px;">${formatJapanDateTime(bookingEnd)}</td>
        </tr>
        <tr>
        <td style="padding: 8px; font-weight: bold;">Purpose</td>
        <td style="padding: 8px;">${purpose}</td>
        </tr>
        </table>
        <br />
        <p>
           Your parking slot has been reserved for the above period.
        </p>
        <hr />
        <p style="font-size: 12px; color: #777;">
           This is an automated email from EliteSpot.
        </p>
        </div>
      `
    };
    await transporter.sendMail(mailOptions);
    logger.info("Multiple Day Car Parking approval email sent to employee", {
      recipientEmail,
      requestId
    });
    return true;
  } catch (error) {
    logger.error("Failed to send Multiple Day Car Parking approval email", {
      recipientEmail,
      requestId,
      error: error.message
    });
    throw error;
  }
};

const sendBusinessTripRejectionEmail = async ({
  recipientEmail,
  employeeName,
  slotId,
  bookingStart,
  bookingEnd,
  purpose,
  rejectionReason,
  requestId
}) => {
  try {
    const mailOptions = {
      from: '"EliteSpot Support" <elitespot@daimlertruck.com>',
      to: recipientEmail,
      subject: `Multiple Day Car Parking Request Rejected - ${employeeName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: auto;">
        <h2 style="color: #dc2626;">
           Multiple Day Car Parking Request Rejected
        </h2>
        <p>
           Your Multiple Day Car Parking request has been
        <strong style="color: #dc2626;">rejected</strong>.
        </p>
        <hr />
        <h3>Request Details</h3>
        <table style="border-collapse: collapse; width: 100%;">
        <tr>
        <td style="padding: 8px; font-weight: bold;">Employee Name</td>
        <td style="padding: 8px;">${employeeName}</td>
        </tr>
        <tr>
        <td style="padding: 8px; font-weight: bold;">Parking Slot</td>
        <td style="padding: 8px;">${slotId}</td>
        </tr>
        <tr>
        <td style="padding: 8px; font-weight: bold;">From</td>
        <td style="padding: 8px;">${formatJapanDateTime(bookingStart)}</td>
        </tr>
        <tr>
        <td style="padding: 8px; font-weight: bold;">To</td>
        <td style="padding: 8px;">${formatJapanDateTime(bookingEnd)}</td>
        </tr>
        <tr>
        <td style="padding: 8px; font-weight: bold;">Purpose</td>
        <td style="padding: 8px;">${purpose}</td>
        </tr>
        <tr>
        <td style="padding: 8px; font-weight: bold;">
               Rejection Reason
        </td>
        <td style="padding: 8px; color: #dc2626;">
               ${rejectionReason}
        </td>
        </tr>
        </table>
        <br />
        <p>
           Please contact the administrator if you need further clarification.
        </p>
        <hr />
        <p style="font-size: 12px; color: #777;">
           This is an automated email from EliteSpot.
        </p>
        </div>
        `
    };
    await transporter.sendMail(mailOptions);
    logger.info("Multiple Day Car Parking rejection email sent to employee", {
      recipientEmail,
      requestId
    });
    return true;
  } catch (error) {
    logger.error("Failed to send Multiple Day Car Parking rejection email", {
      recipientEmail,
      requestId,
      error: error.message
    });
    throw error;
  }
};

// Export function
module.exports = {
  sendResetEmail,
  sendReminderEmail,
  sendParkingReminderEmail,
  sendCancellationEmail,
  sendDailyFeedbackSummaryEmail,
  sendBusinessTripRequestEmail,
  sendBusinessTripApprovalEmail,
  sendBusinessTripRejectionEmail
};