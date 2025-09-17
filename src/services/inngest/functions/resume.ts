import { db } from "@/app/drizzle/db";
import { inngest } from "../client";
import { eq } from "drizzle-orm";
import { UserResumeTable } from "@/app/drizzle/schema";
import { env } from "@/app/data/env/server";
import { updateUserResume } from "@/features/users/db/userResume";

/**
 * Upload a PDF (fetched from a URL) to Gemini Files API and return { fileUri, mimeType, fileName }.
 * Docs: https://ai.google.dev/gemini-api/docs/files
 */
async function uploadPdfToGeminiFromUrl(url: string, apiKey: string) {
  // 1) Download the resume
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch resume: ${res.status}`);
  const mimeType = res.headers.get("content-type") ?? "application/pdf";
  const bytes = new Uint8Array(await res.arrayBuffer());

  // 2) Start a resumable upload session
  const start = await fetch(
    `https://generativelanguage.googleapis.com/upload/v1beta/files?key=${apiKey}`,
    {
      method: "POST",
      headers: {
        "X-Goog-Upload-Protocol": "resumable",
        "X-Goog-Upload-Command": "start",
        "X-Goog-Upload-Header-Content-Length": String(bytes.byteLength),
        "X-Goog-Upload-Header-Content-Type": mimeType,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ file: { display_name: "resume.pdf" } }),
    }
  );

  const uploadUrl = start.headers.get("x-goog-upload-url");
  if (!uploadUrl) throw new Error("Gemini: missing upload URL");

  // 3) Upload & finalize
  const finish = await fetch(uploadUrl, {
    method: "POST",
    headers: {
      "Content-Length": String(bytes.byteLength),
      "X-Goog-Upload-Offset": "0",
      "X-Goog-Upload-Command": "upload, finalize",
    },
    body: bytes,
  });

  const json = await finish.json();
  const fileUri = json?.file?.uri as string | undefined;
  const fileName = json?.file?.name as string | undefined;
  if (!fileUri) throw new Error("Gemini: missing fileUri");
  return { fileUri, mimeType, fileName };
}

export const createAiSummaryOfUploadedResume = inngest.createFunction(
  {
    id: "create-ai-summary-of-uploaded-resume",
    name: "Create AI Summary of Uploaded Resume",
  },
  { event: "app/resume.uploaded" },
  async ({ step, event }) => {
    const { id: userId } = event.user;

    const userResume = await step.run("get-user-resume", async () => {
      return await db.query.UserResumeTable.findFirst({
        where: eq(UserResumeTable.userId, userId),
        columns: { resumeFileUrl: true },
      });
    });
    if (!userResume?.resumeFileUrl) return;

    // Upload the PDF so Gemini can read it
    const { fileUri } = await step.run(
      "upload-to-gemini",
      () => uploadPdfToGeminiFromUrl(userResume.resumeFileUrl!, env.GEMINI_API_KEY)
    );

    // Call Gemini 2.5 Pro
    const result = await step.ai.infer("create-ai-summary", {
      model: step.ai.models.gemini({
        model: "gemini-2.5-pro",
        apiKey: env.GEMINI_API_KEY,
      }),
      body: {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "Summarize the following resume and extract all key skills, experience, and qualifications. The summary should include all the information that a hiring manager would need to know about the candidate in order to determine if they are a good fit for a job. This summary should be formatted as markdown. Do not return any other text. If the file does not look like a resume return the text 'N/A'.",
              },
              {
                fileData: {
                  fileUri: fileUri,
                  mimeType: "application/pdf",
                }
              } as any,
            ],
          },
        ],
      },
    });

    await step.run("save-ai-summary", async () => {
      try {
        const textPart = result?.candidates?.[0]?.content?.parts?.find((p: unknown) => p && typeof p === 'object' && 'text' in p);
        const text = textPart && 'text' in textPart ? textPart.text : null;
        
        if (typeof text !== "string" || !text.trim()) {
          console.log('No valid AI summary text found for user:', userId);
          return;
        }
        
        if (text.trim() === 'N/A') {
          console.log('Gemini determined this is not a resume for user:', userId);
          return;
        }
        
        console.log('Saving AI summary for user:', userId, '- Length:', text.length);
        await updateUserResume(userId, { aiSummary: text });
        console.log('AI summary saved successfully for user:', userId);
        
      } catch (error) {
        console.error('Failed to save AI summary for user:', userId, error);
        throw error;
      }
    });
  }
);