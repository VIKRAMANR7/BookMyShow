import nodemailer from "nodemailer";

import { AppError } from "../server.js";

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
}

function validateEnv(): void {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS || !process.env.SENDER_EMAIL) {
    throw new AppError("❌ Missing SMTP environment variables", 500);
  }
}

validateEnv();

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    const { to, subject, body } = options;

    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to,
      subject,
      html: body,
    });

    console.log(`📨 Email sent to ${to}`);
  } catch (error) {
    console.error("Email sending failed:", error);
    throw new AppError("Failed to send email", 500);
  }
}

export default sendEmail;
