const express = require("express");
const router = express.Router();
const sendEmail = require('./sendEmail')

router.get("/test-email", async (req, res) => {
  try {
    await sendEmail({
      to: "fumicha.3fan1@gmail.com",
      subject: "Test Email",
      html: "<h2>If you see this email, your Nodemailer config works!</h2>"
    });

    res.send("Email sent!");
  } catch (e) {
    console.log("❌ Email Error:", e);
    res.send("Error: " + e.message);
  }
});

module.exports = router;
