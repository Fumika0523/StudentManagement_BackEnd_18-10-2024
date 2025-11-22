const nodemailer = require("nodemailer");

const sendEmail = async ({ to, subject, html }) => {
  try {
    console.log("📨 Preparing to send email...");
    console.log("➡ Sending TO:", to);

    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      }
    });

    console.log("🔐 Gmail transporter created.");

    const info = await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      html
    });

    console.log("✅ Email SENT successfully!");
    console.log("📧 Message ID:", info.messageId);
    console.log("📝 Response:", info.response);

    return info;

  } catch (error) {
    console.error("❌ Email Sending FAILED:");
    console.error(error);
    throw error;
  }
};

module.exports = sendEmail;
