const nodemailer = require("nodemailer");

const hasSmtpConfig = () =>
  Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);

const createTransporter = () =>
  nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: String(process.env.SMTP_SECURE).toLowerCase() === "true",
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

const sendMail = async ({ to, subject, text, html }) => {
  if (!hasSmtpConfig()) {
    return { skipped: true, reason: "SMTP is not configured" };
  }

  const transporter = createTransporter();
  return transporter.sendMail({
    from: process.env.MAIL_FROM || "Assignopedia <no-reply@assignopedia.local>",
    to,
    subject,
    text,
    html,
  });
};

module.exports = { sendMail, hasSmtpConfig };
