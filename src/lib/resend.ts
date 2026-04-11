import { Resend } from "resend";

export const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  html,
  fromName,
  replyTo,
}: {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
  replyTo?: string;
}) {
  const defaultFrom = process.env.EMAIL_FROM!;
  // If a custom sender name is provided, replace the name portion of the from address
  const from = fromName
    ? `${fromName} <${defaultFrom.match(/<(.+)>/)?.[1] || defaultFrom}>`
    : defaultFrom;

  const { error } = await resend.emails.send({
    from,
    to,
    subject,
    html,
    ...(replyTo ? { replyTo } : {}),
  });

  if (error) {
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
