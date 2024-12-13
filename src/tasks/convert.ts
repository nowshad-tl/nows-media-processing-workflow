// src/tasks/convert.ts
import { schemaTask, logger } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { extractMp3FromVideo } from "../utils/ffmpeg";
import { downloadVideoTask } from "./download";
import { uploadFileToS3 } from "../utils/s3";

export const convertToMp3Task = schemaTask({
  id: "convert-to-mp3",
  schema: z.object({
    videoUrl: z.string(),
  }),
  run: async (input, { ctx }) : Promise<{ mp3File?: string, duration?: number, status: string, reason?: string }> => {
    const { videoUrl } = input;
    logger.info("Starting audio extraction from video", { videoUrl });

    const result = await downloadVideoTask.triggerAndWait({ videoUrl: videoUrl });

    if (!result.ok) {
      logger.error("Failed to download video", { result });
      return { status: "failed", reason: "Failed to download video" };
    }

    const videoBase64 = result.output.videoBase64;
    logger.info("Video downloaded successfully", { videoBase64 });

    // Decode base64 video data to Buffer
    const videoBuffer = Buffer.from(videoBase64, "base64");

    try {
      const { mp3Buffer, duration } = await extractMp3FromVideo(videoBuffer);

      logger.info("MP3 extraction successful", { duration, mp3Size: mp3Buffer.length });

      const s3Url = await uploadFileToS3('audio/converted.mp3', mp3Buffer, "audio/mp3");
      logger.info("MP3 uploaded to S3", { s3Url });
      return { mp3File: s3Url, duration, status: "success" };
    } catch (error: any) {
      logger.error("Failed to extract MP3 from video", { error: error.message });
      return { status: "failed", reason: "Failed to extract MP3 from video" };
    }
  },
});
