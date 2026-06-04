const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtpout.secureserver.net',
  port: 587,
  secure: false,
  requireTLS: true,
  auth: {
    user: 'info@ovuscare.com',
    pass: process.env.TITAN_EMAIL_PASSWORD,
  },
});

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, clinic, email } = req.body ?? {};

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    await transporter.sendMail({
      from: '"OvusCare" <info@ovuscare.com>',
      to: 'info@ovuscare.com',
      replyTo: email,
      subject: `Demo Request from ${clinic || name}`,
      html: `
        <h2 style="font-family:sans-serif;color:#1A2B2B">New Demo Request</h2>
        <table style="font-family:sans-serif;font-size:15px;color:#334155;border-collapse:collapse">
          <tr><td style="padding:6px 16px 6px 0;color:#64748B">Name</td><td>${escapeHtml(name)}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748B">Clinic</td><td>${escapeHtml(clinic || '—')}</td></tr>
          <tr><td style="padding:6px 16px 6px 0;color:#64748B">Email</td><td><a href="mailto:${escapeHtml(email)}" style="color:#0D9488">${escapeHtml(email)}</a></td></tr>
        </table>
        <p style="font-family:sans-serif;font-size:13px;color:#94A3B8;margin-top:24px">
          Sent via ovuscare.com contact form
        </p>
      `,
    });

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Nodemailer error code:', error.code);
    console.error('Nodemailer error message:', error.message);
    console.error('Nodemailer response:', error.response);
    return res.status(500).json({
      error: 'Failed to send email',
      code: error.code,
      message: error.message,
    });
  }
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
