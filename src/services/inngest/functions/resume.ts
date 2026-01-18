import { db } from "@/app/drizzle/db";
import { inngest } from "../client";
import { eq } from "drizzle-orm";
import { UserResumeTable } from "@/app/drizzle/schema";
import { env } from "@/app/data/env/server";
import { updateUserResume } from "@/features/users/db/userResume";

/**
 * Upload PDF to Gemini Files API
 */
async function uploadPdfToGeminiFromUrl(url: string, apiKey: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to fetch resume: ${res.status}`);

  const mimeType = res.headers.get("content-type") ?? "application/pdf";
  const bytes = new Uint8Array(await res.arrayBuffer());

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
      body: JSON.stringify({
        file: { display_name: "resume.pdf" },
      }),
    }
  );

  const uploadUrl = start.headers.get("x-goog-upload-url");
  if (!uploadUrl) throw new Error("Gemini: missing upload URL");

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
  if (!json?.file?.uri) throw new Error("Gemini: missing fileUri");

  return {
    fileUri: json.file.uri as string,
    mimeType,
  };
}

export const createAiSummaryOfUploadedResume = inngest.createFunction(
  {
    id: "create-ai-summary-of-uploaded-resume",
    name: "Create AI Summary of Uploaded Resume",
  },
  { event: "app/resume.uploaded" },
  async ({ step, event }) => {
    const { id: userId } = event.user;

    if (!env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY not configured");
    }

    const userResume = await step.run("get-user-resume", async () => {
      return db.query.UserResumeTable.findFirst({
        where: eq(UserResumeTable.userId, userId),
        columns: { resumeFileUrl: true },
      });
    });

    if (!userResume?.resumeFileUrl) return;

    const { fileUri } = await step.run("upload-to-gemini", () =>
      uploadPdfToGeminiFromUrl(
        userResume.resumeFileUrl!,
        env.GEMINI_API_KEY
      )
    );

    // Call Gemini API directly with file data
    const result = await step.ai.infer("create-ai-summary", {
      model: step.ai.models.gemini({
        model: "gemini-2.5-flash",
        apiKey: env.GEMINI_API_KEY,
      }),
      body: {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: `You are an expert technical recruiter.

Summarize the resume and extract:
- Professional summary
- Key skills
- Work experience
- Education
- Certifications (if any)

Format the output strictly as **markdown**.
If the document is NOT a resume, return exactly: N/A`,
              },
              {
                fileData: {
                  fileUri: fileUri,
                  mimeType: "application/pdf",
                },
              } as any,
            ],
          },
        ],
      },
    });

    const textPart = result?.candidates?.[0]?.content?.parts?.find(
      (p: unknown) => p && typeof p === "object" && "text" in p
    );
    let text = textPart && "text" in textPart ? textPart.text : null;

    if (!text || typeof text !== "string" || text.trim() === "N/A") return;

    // Strip markdown code fences if present (e.g., ```markdown ... ```)
    text = text
      .replace(/^```(?:markdown)?\s*\n?/i, "")
      .replace(/\n?```\s*$/i, "")
      .trim();

    await step.run("save-ai-summary", () =>
      updateUserResume(userId, { aiSummary: text })
    );
  }
);
