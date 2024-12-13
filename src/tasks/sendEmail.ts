import { schemaTask, logger } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { sendEmail } from "../utils/postmark";

const LOGO_URL = process.env.LOGO_URL || "https://dev-sequence.traininglayers.com/build/_assets/sequence-logo-icon-V5FCT5ND.png";
const POSTMARK_TO_EMAIL = process.env.POSTMARK_TO_EMAIL || "hello@traininglayers.com";


export const sendEmailTask = schemaTask({
  id: "send-email",
  schema: z.object({
    mp3Url: z.string().url(),
    srtUrl: z.string().url(),
    tenantId: z.string(),
    projectId: z.string(),
  }),
  run: async (input, { ctx }) => {
    const { mp3Url, srtUrl, tenantId, projectId } = input;
    logger.info("Sending email via Postmark", { mp3Url, srtUrl, tenantId, projectId });

    const subject = "Your Video Processing is Complete!";
    const htmlBody = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              color: #333;
            }
            .header {
              text-align: center;
              padding: 20px;
            }
            .logo {
              width: 80px;
              height: 80px;
            }
            .content {
              margin: 20px;
            }
            .cta-button {
              display: inline-block;
              padding: 10px 20px;
              margin: 20px 0;
              background-color: #4285f4;
              color: #fff;
              text-decoration: none;
              border-radius: 4px;
              font-weight: bold;
            }
            .cta-button:hover {
              background-color: #3072C9;
            }
            .metadata {
              margin-top: 20px;
              font-size: 14px;
              color: #666;
            }
            .metadata p {
              margin: 5px 0;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <img src="${LOGO_URL}" alt="Logo" class="logo" />
            <h1 style="font-size:1.5em;">Your Video Has Been Processed!</h1>
          </div>
          <div class="content">
            <p>Hello,</p>
            <p>Your video has been successfully processed. We’ve converted it to MP3 audio and transcribed it. The SRT file is ready as well!</p>
            
            <a href="${mp3Url}" class="cta-button">Download MP3</a>
            
            <p>If you’d like to review the subtitles, you can access the SRT file here:</p>
            <a href="${srtUrl}" class="cta-button">Download SRT</a>
            
            <div class="metadata">
              <p><strong>Tenant ID:</strong> ${tenantId}</p>
              <p><strong>Project ID:</strong> ${projectId}</p>
            </div>

            <p style="margin-top:20px;">
              Thank you for using our service. If you have any questions, feel free to reach out.
            </p>
          </div>
        </body>
      </html>
    `;


    await sendEmail(POSTMARK_TO_EMAIL, subject, htmlBody);

    logger.info("Email sent successfully");

    logger.info("Email sent successfully");
    return { status: "sent" };
  },
});
