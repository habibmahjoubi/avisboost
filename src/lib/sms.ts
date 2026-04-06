import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!
);

export async function sendSms({
  to,
  body,
}: {
  to: string;
  body: string;
}) {
  // Format numéro français : 06... → +336...
  let formattedTo = to.trim();
  if (formattedTo.startsWith("0")) {
    formattedTo = "+33" + formattedTo.slice(1);
  }
  if (!formattedTo.startsWith("+")) {
    formattedTo = "+" + formattedTo;
  }

  const message = await client.messages.create({
    body,
    from: process.env.TWILIO_PHONE_NUMBER!,
    to: formattedTo,
  });

  if (message.errorCode) {
    throw new Error(`SMS failed: ${message.errorMessage}`);
  }

  return message.sid;
}
