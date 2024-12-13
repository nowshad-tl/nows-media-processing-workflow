// src/utils/ffmpeg.ts
import ffmpeg from "fluent-ffmpeg";
import { PassThrough } from "stream";

export async function extractMp3FromVideo(videoBuffer: Buffer): Promise<{
  mp3Buffer: Buffer;
  duration: number;
}> {
  return new Promise((resolve, reject) => {
    const inputStream = new PassThrough();
    inputStream.end(videoBuffer);

    const outputChunks: Buffer[] = [];
    let duration = 0;

    const outputStream = new PassThrough();

    ffmpeg(inputStream)
      .noVideo()
      .audioCodec("libmp3lame")
      .audioBitrate("192k")
      .format("mp3")
      .on("codecData", (data: any) => {
        if (data.duration) {
          const parts = data.duration.split(":").map(parseFloat);
          duration = parts[0] * 3600 + parts[1] * 60 + parts[2];
        }
      })
      .on("error", (err: any) => reject(err))
      .on("end", () => {
        const mp3Buffer = Buffer.concat(outputChunks);
        resolve({ mp3Buffer, duration });
      })
      .pipe(outputStream);

    outputStream.on("data", (chunk: Buffer) => {
      outputChunks.push(chunk);
    });
  });
}
