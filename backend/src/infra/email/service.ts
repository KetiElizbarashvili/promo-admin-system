import nodemailer from 'nodemailer';
import { env } from '../../config/env';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
});

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  try {
    await transporter.sendMail({
      from: env.SMTP_FROM,
      to,
      subject,
      html,
    });
    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error('Email send failed:', error);
    throw new Error('Failed to send email');
  }
}

export async function sendOTPEmail(email: string, code: string): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>KitKat Promo - Verification Code</h2>
      <p>Your verification code is:</p>
      <h1 style="background: #f4f4f4; padding: 20px; text-align: center; letter-spacing: 5px;">
        ${code}
      </h1>
      <p>This code will expire in ${env.OTP_EXPIRY_MINUTES} minutes.</p>
      <p>If you did not request this code, please ignore this email.</p>
    </div>
  `;
  await sendEmail(email, 'Your Verification Code', html);
}

export async function sendStaffCredentials(
  email: string,
  firstName: string,
  username: string,
  password: string
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to KitKat Promo Admin</h2>
      <p>Hello ${firstName},</p>
      <p>Your staff account has been created. Here are your login credentials:</p>
      <div style="background: #f4f4f4; padding: 20px; margin: 20px 0;">
        <p><strong>Username:</strong> ${username}</p>
        <p><strong>Password:</strong> ${password}</p>
      </div>
      <p>Please change your password after first login.</p>
      <p><strong>Important:</strong> Keep these credentials secure and do not share them with anyone.</p>
    </div>
  `;
  await sendEmail(email, 'Your Admin Panel Credentials', html);
}

export async function sendUniqueIDEmail(
  email: string,
  firstName: string,
  uniqueId: string
): Promise<void> {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>KitKat Promo - Registration Success</h2>
      <p>Hello ${firstName},</p>
      <p>You have been successfully registered for the KitKat promotion!</p>
      <div style="background: #f4f4f4; padding: 20px; margin: 20px 0; text-align: center;">
        <p><strong>Your Unique ID:</strong></p>
        <h1 style="color: #e31e24; letter-spacing: 2px;">${uniqueId}</h1>
      </div>
      <p>Use this ID to check your rank on the leaderboard.</p>
      <p>Good luck!</p>
    </div>
  `;
  await sendEmail(email, 'Your KitKat Promo ID', html);
}
