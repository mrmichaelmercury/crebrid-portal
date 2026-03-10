import Anthropic from "@anthropic-ai/sdk";
import { DOCUMENT_CLASSIFICATION_PROMPT } from "./prompts";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface DocumentAnalysis {
  documentType: string;
  confidence: number;
  summary: string;
  extractedData: Record<string, unknown>;
  flags: Array<{
    severity: "HIGH" | "MEDIUM" | "LOW";
    type: "RED_FLAG" | "WARNING" | "INFO";
    message: string;
  }>;
  missingInfo: string[];
  isComplete: boolean;
  completenessNotes: string;
}

export async function analyzeDocument(
  documentContent: string,
  fileName: string,
  mimeType: string
): Promise<DocumentAnalysis> {
  const userMessage = `Analyze this document and return the JSON result.

File name: ${fileName}
File type: ${mimeType}

Document content:
${documentContent.substring(0, 15000)}${documentContent.length > 15000 ? "\n[Content truncated for length]" : ""}`;

  const stream = anthropic.messages.stream({
    model: "claude-opus-4-6",
    max_tokens: 4096,
    thinking: { type: "adaptive" },
    system: DOCUMENT_CLASSIFICATION_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  const response = await stream.finalMessage();

  // Extract text from response (skip thinking blocks)
  const textContent = response.content
    .filter((block) => block.type === "text")
    .map((block) => (block as { type: "text"; text: string }).text)
    .join("");

  // Parse JSON from the response
  const jsonMatch = textContent.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("AI did not return valid JSON for document analysis");
  }

  const result = JSON.parse(jsonMatch[0]) as DocumentAnalysis;
  return result;
}

export async function extractTextFromFile(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<string> {
  if (mimeType === "application/pdf") {
    // Use pdf-parse for PDFs
    const pdfParse = await import("pdf-parse");
    const data = await pdfParse.default(fileBuffer);
    return data.text;
  }

  if (mimeType.startsWith("image/")) {
    // For images, use Claude's vision capability directly
    const base64 = fileBuffer.toString("base64");

    const response = await anthropic.messages.create({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as
                  | "image/jpeg"
                  | "image/png"
                  | "image/gif"
                  | "image/webp",
                data: base64,
              },
            },
            {
              type: "text",
              text: "Extract and transcribe ALL text content from this document image. Include all numbers, addresses, names, dates, and financial figures. Preserve the structure where possible.",
            },
          ],
        },
      ],
    });

    return response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");
  }

  if (
    mimeType === "text/plain" ||
    mimeType === "text/csv" ||
    fileName.endsWith(".txt")
  ) {
    return fileBuffer.toString("utf-8");
  }

  // For other file types, return a placeholder
  return `[Binary file: ${fileName} - ${mimeType}. Manual review required.]`;
}

export async function processDocumentWithVision(
  fileBuffer: Buffer,
  mimeType: string,
  fileName: string
): Promise<DocumentAnalysis> {
  const isImage = mimeType.startsWith("image/");

  if (isImage) {
    // For images, send directly to Claude vision with classification prompt
    const base64 = fileBuffer.toString("base64");

    const stream = anthropic.messages.stream({
      model: "claude-opus-4-6",
      max_tokens: 4096,
      thinking: { type: "adaptive" },
      system: DOCUMENT_CLASSIFICATION_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mimeType as
                  | "image/jpeg"
                  | "image/png"
                  | "image/gif"
                  | "image/webp",
                data: base64,
              },
            },
            {
              type: "text",
              text: `Analyze this document image. File: ${fileName}. Return the JSON analysis.`,
            },
          ],
        },
      ],
    });

    const response = await stream.finalMessage();
    const textContent = response.content
      .filter((b) => b.type === "text")
      .map((b) => (b as { type: "text"; text: string }).text)
      .join("");

    const jsonMatch = textContent.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON returned from vision analysis");
    return JSON.parse(jsonMatch[0]) as DocumentAnalysis;
  }

  // For PDFs and other files, extract text first then analyze
  const text = await extractTextFromFile(fileBuffer, mimeType, fileName);
  return analyzeDocument(text, fileName, mimeType);
}
