import { logger, task } from "@trigger.dev/sdk/v3";
import { downloadVideoTask } from "./tasks/download";
import { MediaProcessingRequest } from "./models/media-processing-request";
import { convertToMp3Task } from "./tasks/convert";

export const processVideoTask = task({
  id: "process-video",
  // Stop execution if it runs longer than 5 minutes
  maxDuration: 300,
  run: async (payload: MediaProcessingRequest, { ctx }) => {
    const { videoUrl } = payload;

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

      const mp3Base64 = convertResult.output.mp3Base64;
      const duration = convertResult.output.duration;

      logger.info("Video converted to MP3 successfully", { mp3Base64, duration });  

      // Continue with further processing steps here...

      return { status: "success", mp3Base64, duration };
    } catch (error) {
      logger.error("Error during video download", { error });
      return { status: "failed", reason: "Error during video download" };
    }
  },
});
