import postmark from "postmark";

const POSTMARK_SERVER_TOKEN = process.env.POSTMARK_SERVER_TOKEN;
const POSTMARK_FROM_EMAIL = process.env.POSTMARK_FROM_EMAIL;

if (!POSTMARK_SERVER_TOKEN || !POSTMARK_FROM_EMAIL) {
  throw new Error("Postmark environment variables are not set properly.");
}

export const sendEmail = async (to: string, subject: string, htmlBody: string) => {
  const client = new postmark.ServerClient(POSTMARK_SERVER_TOKEN);
  await client.sendEmail({
    To: to,
    From: POSTMARK_FROM_EMAIL,
    Subject: subject,
    HtmlBody: htmlBody,
  });
};
