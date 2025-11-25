import nodemailer from "nodemailer";

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
}

const transporter = nodemailer.createTransport({
  host: "smtp-relay.brevo.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER!,
    pass: process.env.SMTP_PASS!,
  },
});

export async function sendEmail({ to, subject, body }: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: process.env.SENDER_EMAIL!,
      to,
      subject,
      html: body,
    });

    console.log(`Email sent to ${to}`);
  } catch {
    console.error("Failed to send email");
  }
}

export default sendEmail;
