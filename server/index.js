import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import nodemailer from "nodemailer";
import QRCode from "qrcode";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app = express();
const port = Number(process.env.EMAIL_SERVER_PORT || 5000);

app.use(cors({ origin: process.env.CLIENT_ORIGIN || "http://localhost:8080" }));
app.use(express.json({ limit: "1mb" }));

const event = {
  id: "coffee-alumni-2026",
  name: "Coffee With Alumni",
  date: "Friday, June 12",
  time: "5:30 PM onwards",
  venue: "IS Seminar Hall 2",
};

function createTransporter() {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    throw new Error("SMTP_USER and SMTP_PASS are required.");
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });
}

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/send-registration-email", async (req, res) => {
  try {
    const { participant } = req.body;
    if (!participant?.email || !participant?.name || !participant?.registration_code || !participant?.qr_data) {
      return res.status(400).json({ error: "Participant email, name, registration code, and QR data are required." });
    }

    const qrBuffer = await QRCode.toBuffer(JSON.stringify(participant.qr_data), {
      width: 420,
      margin: 2,
      color: {
        dark: "#1e4b6b",
        light: "#ffffff",
      },
    });

    const transporter = createTransporter();
    await transporter.sendMail({
      from: process.env.REGISTRATION_EMAIL_FROM || `Persona+ <${process.env.SMTP_USER}>`,
      to: participant.email,
      subject: `${event.name} Registration Confirmation`,
      html: `
        <p>Hello ${participant.name},</p>
        <p>You have successfully registered for <strong>${event.name}</strong>.</p>
        <p>
          <strong>Registration ID:</strong> ${participant.id}<br>
          <strong>Registration Code:</strong> ${participant.registration_code}<br>
          <strong>USN:</strong> ${participant.usn}
        </p>
        <p>
          <strong>Event Date:</strong> ${event.date}, ${event.time}<br>
          <strong>Venue:</strong> ${event.venue}
        </p>
        <p>Please keep the attached QR code safe and present it during event check-in.</p>
        <p>Thank you.</p>
      `,
      attachments: [
        {
          filename: `${participant.usn}-${participant.registration_code}.png`,
          content: qrBuffer,
          contentType: "image/png",
        },
      ],
    });

    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Email sending failed." });
  }
});

app.use(express.static(path.join(__dirname, "../dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../dist/index.html"));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
