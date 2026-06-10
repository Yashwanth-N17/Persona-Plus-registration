import nodemailer from "nodemailer";
import QRCode from "qrcode";

const event = {
  id: "coffee-alumni-2026",
  name: "Coffee With Alumni",
  date: "Friday, June 12",
  time: "5:30 PM onwards",
  venue: "IS Seminar Hall 2",
};

export default async function handler(req, res) {
  // Add CORS headers to allow requests from the frontend
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    // Vercel automatically parses JSON bodies
    const { participant } = req.body || {};
    
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

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

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

    res.status(200).json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: error instanceof Error ? error.message : "Email sending failed." });
  }
}
