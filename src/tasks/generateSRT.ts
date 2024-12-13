// src/tasks/generateSRT.ts
import { schemaTask, logger } from "@trigger.dev/sdk/v3";
import { z } from "zod";
import { uploadFileToS3 } from "../utils/s3";

function secondsToSrtTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  const millis = Math.floor((seconds - Math.floor(seconds)) * 1000);

  const hh = hours.toString().padStart(2, "0");
  const mm = mins.toString().padStart(2, "0");
  const ss = secs.toString().padStart(2, "0");
  const mmm = millis.toString().padStart(3, "0");

  return `${hh}:${mm}:${ss},${mmm}`;
}

function isSentenceEnd(word: string): boolean {
    // Check if the word ends with punctuation that might denote sentence end
    const lastChar = word.slice(-1);
    return [".", "?", "!"].includes(lastChar);
  }

export const generateSrtTask = schemaTask({
  id: "generate-srt",
  schema: z.object({
    transcriptionUrl: z.string().url(),
  }),
  run: async (input, { ctx }): Promise<{ srtUrl: string }> => {
    const { transcriptionUrl } = input;
    logger.info("Fetching transcription from URL", { transcriptionUrl });

    const response = await fetch(transcriptionUrl);
    if (!response.ok) {
      logger.error("Failed to fetch transcription", {
        status: response.status,
        statusText: response.statusText,
      });
      throw new Error("Failed to fetch transcription JSON");
    }

    const transcription = await response.json();
    logger.info("Transcription JSON retrieved successfully");

    const channels = transcription?.results?.channels;
    if (!channels || channels.length === 0) {
      throw new Error("No channels in transcription data");
    }

    const alternatives = channels[0].alternatives;
    if (!alternatives || alternatives.length === 0) {
      throw new Error("No alternatives in transcription data");
    }

    const alternative = alternatives[0];
    const words = alternative.words || [];
    if (words.length === 0) {
      throw new Error("No words in transcription");
    }

    // Create a single SRT cue
    // Segment the words into multiple cues
    let cues = [];
    let currentSegmentWords: string[] = [];
    let currentSegmentStart = words[0].start;
    const maxWordsPerSegment = 12; // optional fallback limit

    for (let i = 0; i < words.length; i++) {
      const w = words[i];
      currentSegmentWords.push(w.punctuated_word);

      const isEndOfSentence = isSentenceEnd(w.word);
      const reachedMaxWords = currentSegmentWords.length >= maxWordsPerSegment;

      // End the segment if we hit a sentence boundary or max words
      if (isEndOfSentence || reachedMaxWords || i === words.length - 1) {
        const segmentStart = currentSegmentStart;
        const segmentEnd = w.end;
        const segmentText = currentSegmentWords.join(" ");

        // Create a cue
        cues.push({
          start: segmentStart,
          end: segmentEnd,
          text: segmentText.trim(),
        });

        // Reset for next segment if not at end of words
        if (i < words.length - 1) {
          currentSegmentWords = [];
          currentSegmentStart = words[i + 1].start;
        }
      }
    }

    // Build the SRT content
    let srtContent = "";
    cues.forEach((cue, index) => {
      srtContent += `${index + 1}\n`;
      srtContent += `${secondsToSrtTime(cue.start)} --> ${secondsToSrtTime(cue.end)}\n`;
      srtContent += `${cue.text}\n\n`;
    });

    logger.info("SRT generated", { srtLength: srtContent.length });

    const s3Url = await uploadFileToS3('transcriptions/transcription.srt', Buffer.from(srtContent), "text/srt");
    logger.info("SRT uploaded to S3", { s3Url });

    return { srtUrl: s3Url };
  },
});
