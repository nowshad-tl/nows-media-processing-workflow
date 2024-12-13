// src/tasks/transcribe.ts
import { schemaTask, logger } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { getObjectStream, uploadFileToS3 } from "../utils/s3";
import { transcribeUrl } from "../utils/deepgram";

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
if (!DEEPGRAM_API_KEY) {
  throw new Error("DEEPGRAM_API_KEY is not set in environment variables");
}

export const transcribeAudioTask = schemaTask({
  id: "transcribe-audio",
  schema: z.object({
    audioUrl: z.string(), // The S3 object key of the MP3 file
  }),
  run: async (input, { ctx }) => {
    const { audioUrl } = input;
    logger.info("Starting transcription with Deepgram", { audioUrl });

    try {
      const response = await transcribeUrl(audioUrl);

      if(response.error) {
        logger.error("Deepgram transcription failed", {
          status: response.error.status,
          statusText: response.error.message,
        });
        throw new Error(`Deepgram request failed with status ${response.error.status}`);
      }


      const transcriptionResult = response.result;
      const metadata = transcriptionResult?.metadata;
      logger.info("Transcription received", {
        transcriptSnippet: transcriptionResult?.results?.channels?.[0]?.alternatives?.[0]?.transcript?.slice(0, 50),
      });

      // Upload the transcription as a JSON file to S3
      const s3Url = await uploadFileToS3(
        'transcriptions/transcription.json',
        Buffer.from(JSON.stringify(transcriptionResult)),
        "application/json"
      );
      logger.info("Transcription uploaded to S3", { s3Url });

      return { transcriptionUrl: s3Url };
    } catch (error: any) {
      logger.error("Error during transcription", { error: error.message });
      throw new Error("Transcription failed");
    }
  },
});
