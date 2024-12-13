// src/utils/deepgram.ts
import { createClient } from "@deepgram/sdk";

const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
if (!DEEPGRAM_API_KEY) {
  throw new Error("DEEPGRAM_API_KEY is not set in environment variables");
}

export const transcribeUrl = async (url: string): Promise<{ result?: any, error?: any }> => {
  const deepgram = createClient(DEEPGRAM_API_KEY);

  const { result, error } = await deepgram.listen.prerecorded.transcribeUrl(
    {
      url: url,
    },
    {
      model: "nova-2",
      smart_format: true,
    }
  );

  if (error) return { error };
  return { result };
};
