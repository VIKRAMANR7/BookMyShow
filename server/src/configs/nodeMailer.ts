import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
}

function validateEmailEnv(): boolean {
  return Boolean(process.env.SMTP_USER && process.env.SMTP_PASS && process.env.SENDER_EMAIL);
}

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendEmail(options: EmailOptions): Promise<void> {
  if (!validateEmailEnv()) {
    console.error("Missing email environment variables");
    return;
  }

  try {
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL,
      to: options.to,
      subject: options.subject,
      html: options.body,
    });

    console.log(`Email sent to ${options.to}`);
  } catch {
    console.error("Failed to send email");
  }
}

export default sendEmail;
