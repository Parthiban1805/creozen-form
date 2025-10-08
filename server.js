const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const { google } = require("googleapis");
const credentials = require("./creozen-website-forms-d79194a54ef8.json");

const app = express();
app.use(cors());
app.use(bodyParser.json());

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "creozen.ai@gmail.com",
    pass: "ozbd mzqx jkxz tsrg",
  },
});

// --- GOOGLE SHEETS SETUP ---
const SPREADSHEET_ID = "17PIn6YrACG5TIijWPbuu6DT7w3Ujl0ySPgKt4ztnTTM"; // Replace with your Spreadsheet ID
// const credentials = require("./creozen-website-forms-d79194a54ef8.json"); // Replace with the path to your credentials file

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: "https://www.googleapis.com/auth/spreadsheets",
});

const sheets = google.sheets({ version: "v4", auth });

async function appendToSheet(data) {
  try {
    const res = await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: "Sheet1!A1", // The sheet and range to append to
      valueInputOption: "USER_ENTERED",
      resource: {
        values: [
          [
            new Date().toISOString(), // Timestamp
            data.name,
            data.email,
            data.phone || "N/A",
            data.finalDesignation,
            data.willing || "N/A",
            data.formType,
          ],
        ],
      },
    });
    console.log("✅ Appended data to Google Sheet:", res.data);
  } catch (error) {
    console.error("❌ Error appending to Google Sheet:", error);
  }
}
// --- END GOOGLE SHEETS SETUP ---

app.post("/api/forms", async (req, res) => {
  try {
    const data = req.body;
    console.log("📩 Received form data:", data);

    const adminMailOptions = {
      from: `"Creozen Registration" <${data.email}>`,
      to: "creozen.ai@gmail.com",
      subject: `New ${data.formType} Submission from ${data.name}`,
      html: `
        <h2>New ${data.formType} Registration</h2>
        <p><strong>Name:</strong> ${data.name}</p>
        <p><strong>Email:</strong> ${data.email}</p>
        <p><strong>Phone:</strong> ${data.phone || "N/A"}</p>
        <p><strong>Designation:</strong> ${data.finalDesignation}</p>
        ${data.willing ? `<p><strong>Willing:</strong> ${data.willing}</p>` : ""}
      `,
    };

    const userMailOptions = {
      from: `"Creozen Team" <your_email@gmail.com>`,
      to: data.email,
      subject: "✅ Your Registration Has Been Received!",
      html: `
        <h2>Hi ${data.name},</h2>
        <p>Thank you for registering for the <strong>${data.formType}</strong>!</p>
        <p>We’ve successfully received your details:</p>
        <ul>
          <li><b>Name:</b> ${data.name}</li>
          <li><b>Designation:</b> ${data.finalDesignation}</li>
          <li><b>Email:</b> ${data.email}</li>
          <li><b>Phone:</b> ${data.phone || "N/A"}</li>
        </ul>
        <p>We’ll contact you soon with more information.</p>
        <p style="margin-top: 20px;">Best Regards,<br/><b>Creozen Team</b></p>
      `,
    };

    await transporter.sendMail(adminMailOptions);
    await transporter.sendMail(userMailOptions);

    console.log("✅ Emails sent successfully!");

    // --- APPEND TO GOOGLE SHEET ---
    await appendToSheet(data);

    res
      .status(200)
      .json({ success: true, message: "Emails sent successfully!" });
  } catch (error) {
    console.error("❌ Error processing request:", error);
    res.status(500).json({ success: false, message: "Server error." });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));