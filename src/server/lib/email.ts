import 'dotenv/config';
import nodemailer from 'nodemailer';

export const SMTP_HOST = process.env.SMTP_HOST || '127.0.0.1';
export const SMTP_PORT = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 25;
export const SMTP_USER = process.env.SMTP_USER || 'user';
export const SMTP_PASS = process.env.SMTP_PASS || 'pass'; 
export const SMTP_FROM = process.env.SMTP_FROM || '"React Admin" <reactadmin@127.0.0.1>'; 

function getTranporter() {
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  });
}

export async function sendResetEmail(to: string, resetLink: string) {
  const transporter = getTranporter();

  await transporter.sendMail({
    from: SMTP_FROM,
    to,
    subject: 'Password Reset Instructions',
    html: `
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
      <p>This link will expire in 1 hour.</p>
    `
  });
}