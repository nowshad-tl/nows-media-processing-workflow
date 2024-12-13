// src/tasks/convert.ts
import { schemaTask, logger } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { extractMp3FromVideo } from "../utils/ffmpeg";
import { downloadVideoTask } from "./downloadVideo";
import { uploadFileToS3 } from "../utils/s3";

export const parseAudioTask = schemaTask({
  id: "parse-audio",
  schema: z.object({
    videoUrl: z.string(),
  }),
  run: async (input, { ctx }) : Promise<{ mp3File?: string, duration?: number, status: string, reason?: string }> => {
    const { videoUrl } = input;
    logger.info("Starting audio extraction from video", { videoUrl });

    const response = await fetch(videoUrl);
    if (!response.ok) {
      logger.error("Failed to download video", { status: response.status, statusText: response.statusText });
      throw new Error(`Failed to download video from ${videoUrl}`);
    }

    const videoArrayBuffer = await response.arrayBuffer();

    try {
      const { mp3Buffer, duration } = await extractMp3FromVideo(Buffer.from(videoArrayBuffer));

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
