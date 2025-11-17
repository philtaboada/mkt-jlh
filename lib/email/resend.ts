/* Utility to send emails via Resend. Looks for RESEND_API_KEY in env.
   If the `resend` package is available, you can swap to the SDK easily.
*/

type SendEmailParams = {
  to: string | string[];
  from?: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, from, subject, html }: SendEmailParams) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('Missing RESEND_API_KEY env var');
  }

  // Use fetch to call Resend v1 send endpoint
  const body = JSON.stringify({
    from: from ?? 'noreply@yourdomain.com',
    to,
    subject,
    html,
  });

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Resend send failed: ${res.status} ${text}`);
  }

  return res.json();
}
