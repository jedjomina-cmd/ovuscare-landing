const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, clinic, email } = req.body ?? {};

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required' });
  }

  try {
    await resend.emails.send({
      // Update 'from' to 'noreply@ovuscare.com' once ovuscare.com is verified in Resend.
      // Until then, Resend's shared domain works for testing but marks sender as onboarding@resend.dev.
      from: 'OvusCare <onboarding@resend.dev>',
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
    console.error('Resend error:', error);
    return res.status(500).json({ error: 'Failed to send email' });
  }
};

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
