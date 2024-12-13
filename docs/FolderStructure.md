.
├─ src
│  ├─ index.ts           // Entry point for the Trigger.dev workflow job
│  ├─ tasks              // All the separate tasks (sub-workflows) for clarity
│  │  ├─ download.ts     // Logic to download and validate the video
│  │  ├─ convert.ts      // Logic to convert the video to MP3 audio
│  │  ├─ transcribe.ts   // Logic for sending audio to Deepgram and retrieving JSON transcription
│  │  ├─ generateSRT.ts  // Logic for parsing Deepgram JSON and generating SRT subtitles
│  │  ├─ upload.ts       // Logic for uploading MP3 and SRT files to S3
│  │  ├─ notifySlack.ts  // Logic for sending Slack notifications
│  │  └─ notifyEmail.ts  // Logic for sending Postmark emails
│  │
│  ├─ utils              // Utility modules for helpers and shared logic
│  │  ├─ logging.ts      // Helper functions for structured logging or log formatting
│  │  ├─ s3Helper.ts     // Reusable S3 upload code and file key generation logic
│  │  ├─ srtFormatter.ts // Functions specifically for converting JSON transcripts to SRT format
│  │  └─ ffmpeg.ts       // FFmpeg-related helper functions (if needed)
│  │
│  └─ types              // Type definitions (if you have custom TypeScript interfaces)
│     └─ index.d.ts      // Custom interfaces for the workflow payloads, Deepgram response, etc.
│
└─ package.json
