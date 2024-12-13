import { schemaTask, logger } from "@trigger.dev/sdk/v3";
import { z } from "zod";

const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;
if (!SLACK_WEBHOOK_URL) {
  throw new Error("SLACK_WEBHOOK_URL is not set in environment variables");
}

export const notifySlackTask = schemaTask({
  id: "notify-slack",
  schema: z.object({
    tenantId: z.string(),
    projectId: z.string(),
    transcriptionJsonUrl: z.string().url(),
    srtUrl: z.string().url(),
    mp3Url: z.string().url(),
  }),
  run: async (input, { ctx }) => {
    const { tenantId, projectId, transcriptionJsonUrl, srtUrl, mp3Url } = input;

    logger.info("Sending Slack notification", { tenantId, projectId });

    const messageBlocks = [
      {
        type: "header",
        text: {
          type: "plain_text",
          text: "✅ Video Processing Complete!",
          emoji: true
        }
      },
      {
        type: "section",
        fields: [
          {
            type: "mrkdwn",
            text: `*Tenant ID:*\n${tenantId}`
          },
          {
            type: "mrkdwn",
            text: `*Project ID:*\n${projectId}`
          }
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: "*Generated Files:*"
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: 
            `:white_check_mark: *Transcription JSON:*\n${transcriptionJsonUrl}\n\n` + 
            `:white_check_mark: *SRT File:*\n${srtUrl}\n\n` +
            `:white_check_mark: *Processed Audio:*\n${mp3Url}`
        }
      },
      {
        type: "context",
        elements: [
          {
            type: "mrkdwn",
            text: "_This message was sent by the Trigger.dev workflow._"
          }
        ]
      }
    ];

    const payload = { blocks: messageBlocks };

    const response = await fetch(SLACK_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      logger.error("Failed to send Slack notification", {
        status: response.status,
        statusText: response.statusText
      });
      throw new Error("Slack notification failed");
    }

    logger.info("Slack notification sent successfully");
    return { status: "sent" };
  },
});
