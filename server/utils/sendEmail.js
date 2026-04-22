const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
};

const sendVerificationOTP = async (email, name, otp) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"SmartHire" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '✅ Verify Your SmartHire Account',
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center; border-radius: 16px 16px 0 0;">
          <h1 style="color: white; margin: 0;">💼 SmartHire</h1>
        </div>
        <div style="padding: 32px; background: white;">
          <h2 style="color: #1e293b;">Hello, ${name}! 👋</h2>
          <p style="color: #64748b;">Use the OTP below to verify your email address.</p>
          <div style="background: #f1f5f9; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="color: #64748b; margin: 0 0 8px;">Your verification code</p>
            <h1 style="color: #6366f1; font-size: 48px; letter-spacing: 8px; margin: 0;">${otp}</h1>
            <p style="color: #94a3b8; margin: 8px 0 0; font-size: 12px;">Expires in 10 minutes</p>
          </div>
        </div>
      </div>
    `,
  });
};

const sendPasswordResetEmail = async (email, name, otp) => {
  const transporter = createTransporter();
  await transporter.sendMail({
    from: `"SmartHire" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: '🔑 Reset Your SmartHire Password',
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: auto;">
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px; text-align: center; border-radius: 16px 16px 0 0;">
          <h1 style="color: white; margin: 0;">💼 SmartHire</h1>
        </div>
        <div style="padding: 32px; background: white;">
          <h2 style="color: #1e293b;">Hello, ${name}! 👋</h2>
          <p style="color: #64748b;">Use this OTP to reset your password.</p>
          <div style="background: #f1f5f9; border-radius: 12px; padding: 24px; text-align: center; margin: 24px 0;">
            <p style="color: #64748b; margin: 0 0 8px;">Your password reset code</p>
            <h1 style="color: #6366f1; font-size: 48px; letter-spacing: 8px; margin: 0;">${otp}</h1>
            <p style="color: #94a3b8; margin: 8px 0 0; font-size: 12px;">Expires in 15 minutes</p>
          </div>
        </div>
      </div>
    `,
  });
};

module.exports = { sendVerificationOTP, sendPasswordResetEmail };