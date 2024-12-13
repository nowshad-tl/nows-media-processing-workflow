# Media Processing Workflow Checklist

## Overview
This document outlines the steps and tasks required to build a fully cloud-based media processing workflow using Trigger.dev v3. The workflow will:

- Ingest a public MP4 or WebM video file
- Convert it to MP3
- Transcribe audio using Deepgram
- Generate SRT subtitles from the transcription
- Store MP3 and SRT in S3
- Notify via Slack and Postmark email
- Include structured logging and error handling

## Prerequisites
- **Trigger.dev Account**: Access to Trigger.dev dashboard for environment configuration.
- **Repl.it Environment**: Node.js environment with `@trigger.dev/sdk` and other dependencies.
- **Services**:
  - **S3**: AWS credentials with write permission.
  - **Deepgram**: API key.
  - **Slack**: Webhook URL or Bot token with write permissions to a channel.
  - **Postmark**: Server token for sending emails.

## Environment Variables
Set the following in Trigger.dev (not in code directly):
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET_NAME`
- `DEEPGRAM_API_KEY`
- `SLACK_WEBHOOK_URL`
- `POSTMARK_SERVER_TOKEN`
- `POSTMARK_FROM_EMAIL`
- `POSTMARK_TO_EMAIL`
- Any additional variables as needed.

## Workflow Steps

1. **Trigger Setup**  
   - Create a Trigger.dev event to start the job.
   - Confirm the event payload includes the public video URL.

2. **Input Validation**  
   - Confirm the file URL ends in `.mp4` or `.webm`.
   - Log the initial input details.

3. **Download Video**  
   - Fetch the video file from the given URL.
   - Store temporarily (if needed) in-memory or a transient storage.
   - Log metadata: file size, format, duration (if easily accessible).

4. **Convert to MP3 Audio**  
   - Use FFmpeg (or a Node wrapper) to convert from video to MP3.
   - Validate output MP3 size, duration.
   - Log conversion details.

5. **Transcription with Deepgram**  
   - Send MP3 audio bytes to Deepgram’s API.
   - Retrieve JSON transcription.
   - Log transcription metadata (e.g., transcript length, confidence scores).

6. **Generate SRT File**  
   - Parse the Deepgram JSON.
   - Convert timestamps and text into valid SRT format:
     ```
     1
     00:00:00,000 --> 00:00:04,000
     First line of caption.

     2
     00:00:04,000 --> 00:00:08,000
     Second line of caption.
     ```
   - Log success and file size/line count.

7. **Upload to S3**  
   - Upload MP3 and SRT to AWS S3.
   - Log the S3 keys and URLs.

8. **Slack Notification**  
   - Post a Slack message with:
     - File metadata (original format, final MP3 size, duration).
     - S3 audio file link.
     - A snippet of the SRT file (first few lines).
   - Log success of Slack notification.

9. **Email via Postmark**  
   - Send an email that:
     - Summarizes the processing steps (in a more polished, user-friendly manner).
     - Includes a link to the MP3 file in S3.
     - Provides access to the full SRT transcript (attach or link).
     - Add branding elements like a small logo, a CTA button.
   - Log success of email sending.

10. **Logging & Error Handling**  
    - Use `logger.info`, `logger.warn`, `logger.error` at each step.
    - On any failure, log context and clean up if possible.
    - Ensure workflow fails gracefully and does not leave partial artifacts.

11. **Testing & Verification**
    - Manually trigger the workflow with a known video URL.
    - Check logs in Trigger.dev dashboard.
    - Verify Slack message formatting and SRT snippet.
    - Check email formatting, clickable links, and presence of full SRT.
    - Confirm files are in S3 and accessible.

## Best Practices
- Keep code organized: separate business logic into distinct files.
- Use environment variables for secrets and endpoints.
- Write clear, descriptive log messages.
- Implement retries or error handling in case of transient failures (e.g., network issues).

---

**End of Checklist**
