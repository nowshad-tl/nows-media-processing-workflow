import { logger, schemaTask } from "@trigger.dev/sdk/v3";
import { convertToMp3Task } from "./tasks/convert";
import { transcribeAudioTask } from "./tasks/transcribe";
import { generateSrtTask } from "./tasks/generateSRT";
import { z } from "zod";
import { notifySlackTask } from "./tasks/notifySlack";

export const processVideoTask = schemaTask({
  id: "process-video",
  // Stop execution if it runs longer than 5 minutes
  maxDuration: 300,
  schema: z.object({
    videoUrl: z.string(), // The S3 object key of the MP3 file
    tenantId: z.string(),
    projectId: z.string(),
  }),
  run: async (payload, { ctx }) => {
    const { videoUrl, tenantId, projectId } = payload;

    logger.info("Processing video", { videoUrl });

    if (!videoUrl || typeof videoUrl !== "string") {
      logger.error("Missing or invalid videoUrl in payload", { payload });
      return { status: "failed", reason: "No valid videoUrl provided" };
    }

    // Validate format (must be .mp4 or .webm)
    if (!videoUrl.endsWith(".mp4") && !videoUrl.endsWith(".webm")) {
      logger.error("Invalid video format. Must be MP4 or WebM.", { videoUrl });
      return { status: "failed", reason: "Invalid video format" };
    }

    logger.info("Video URL validated successfully", { videoUrl });

    try {
      const convertResult = await convertToMp3Task.triggerAndWait({ videoUrl });

      if (!convertResult.ok) {
        logger.error("Failed to convert video to MP3", { convertResult });
        return { status: "failed", reason: "Failed to convert video to MP3" };
      }

      const mp3File = convertResult.output.mp3File;
      const duration = convertResult.output.duration;

      if(!mp3File) {
        logger.error("Failed to convert video to MP3", { convertResult });
        return { status: "failed", reason: "Failed to convert video to MP3" };
      }

      logger.info("Video converted to MP3 successfully", { mp3File, duration });  

      const transcriptionResult = await transcribeAudioTask.triggerAndWait({ audioUrl: mp3File });
      if (!transcriptionResult.ok) {
        logger.error("Failed to transcribe audio", { transcriptionResult });
        return { status: "failed", reason: "Failed to transcribe audio" };
      }

      const transcription = transcriptionResult.output;

      logger.info("Audio transcribed successfully", { transcription });

      const srtResult = await generateSrtTask.triggerAndWait({ transcriptionUrl: transcription.transcriptionUrl });
      if (!srtResult.ok) {
        logger.error("Failed to generate SRT", { srtResult });
        return { status: "failed", reason: "Failed to generate SRT" };
      }

      const srtUrl = srtResult.output.srtUrl;
      logger.info("SRT generated successfully", { srtUrl });

      const notifySlackResult = await notifySlackTask.triggerAndWait({
        tenantId,
        projectId,
        transcriptionJsonUrl: transcription.transcriptionUrl,
        srtUrl: srtUrl,
        mp3Url: mp3File,
      });

      if (!notifySlackResult.ok) {
        logger.error("Failed to notify Slack", { notifySlackResult });
        return { status: "failed", reason: "Failed to notify Slack" };
      }

      return { status: "success", mp3File, duration, transcription };
    } catch (error) {
      logger.error("Error during video download", { error });
      return { status: "failed", reason: "Error during video download" };
    }
  },
});
