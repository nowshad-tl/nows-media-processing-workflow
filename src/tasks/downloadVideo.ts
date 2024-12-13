// src/tasks/download.ts
import { schemaTask, logger } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { uploadFileToS3 } from "../utils/s3";
export const downloadVideoTask = schemaTask({
  id: "download-video",
  schema: z.object({
    videoUrl: z.string().url(),
  }),

  run: async (input: { videoUrl: string }, { ctx }) : Promise<{ videoBase64: string }> => {
    const { videoUrl } = input;
    logger.info("Starting video download...", { videoUrl });

    // Fetch the video file
    const response = await fetch(videoUrl);
    if (!response.ok) {
      logger.error("Failed to download video", { status: response.status, statusText: response.statusText });
      throw new Error(`Failed to download video from ${videoUrl}`);
    }

    // Get the video as an ArrayBuffer
    const videoArrayBuffer = await response.arrayBuffer();

    // Convert ArrayBuffer to Buffer, then to base64 string
    const videoBuffer = Buffer.from(videoArrayBuffer);
    const videoBase64 = videoBuffer.toString("base64");

    const s3Url = await uploadFileToS3('video/original.mp4', videoBuffer, "video/mp4");
    logger.info("Video uploaded to S3", { s3Url });

    logger.info("Video downloaded successfully", { size: videoBuffer.length });

    return { videoBase64 };
  },
});
