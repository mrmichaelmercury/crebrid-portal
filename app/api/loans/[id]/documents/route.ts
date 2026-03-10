import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { uploadDocument } from "@/lib/storage";
import { processDocumentWithVision } from "@/lib/ai/document-processor";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loan = await db.loan.findUnique({ where: { id: params.id } });
  if (!loan) {
    return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  }

  if (session.user.role === "BROKER" && loan.brokerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file size (50MB max)
  if (file.size > 50 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 50MB." },
      { status: 400 }
    );
  }

  // Validate file type
  const allowedTypes = [
    "application/pdf",
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/heic",
    "text/plain",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (!allowedTypes.includes(file.type) && file.type !== "") {
    return NextResponse.json(
      { error: `File type ${file.type} not supported.` },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  // Upload to S3
  const { key, url } = await uploadDocument(
    buffer,
    file.name,
    file.type || "application/octet-stream",
    params.id
  );

  // Create document record
  const document = await db.document.create({
    data: {
      loanId: params.id,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type || "application/octet-stream",
      storageKey: key,
      storageUrl: url,
      status: "PROCESSING",
    },
  });

  // Process document with AI (async - don't block the response)
  processDocumentAsync(document.id, buffer, file.type, file.name).catch(
    console.error
  );

  // Update loan status if it's still in DRAFT
  if (loan.status === "DRAFT") {
    await db.loan.update({
      where: { id: params.id },
      data: { status: "DOCUMENTS_PENDING" },
    });
  }

  await db.loanActivity.create({
    data: {
      loanId: params.id,
      userId: session.user.id,
      type: "DOCUMENT_UPLOADED",
      message: `Document uploaded: ${file.name}`,
    },
  });

  return NextResponse.json(document, { status: 201 });
}

async function processDocumentAsync(
  documentId: string,
  buffer: Buffer,
  mimeType: string,
  fileName: string
) {
  try {
    const analysis = await processDocumentWithVision(buffer, mimeType, fileName);

    await db.document.update({
      where: { id: documentId },
      data: {
        aiClassified: true,
        documentType: (analysis.documentType as never) ?? "OTHER",
        aiSummary: analysis.summary,
        aiExtractedData: analysis.extractedData as never,
        aiFlags: analysis.flags as never,
        aiConfidence: analysis.confidence,
        status: analysis.flags.some((f) => f.severity === "HIGH")
          ? "FLAGGED"
          : "APPROVED",
        processedAt: new Date(),
      },
    });
  } catch (err) {
    console.error("AI document processing failed:", err);
    await db.document.update({
      where: { id: documentId },
      data: { status: "PENDING" },
    });
  }
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const loan = await db.loan.findUnique({ where: { id: params.id } });
  if (!loan) {
    return NextResponse.json({ error: "Loan not found" }, { status: 404 });
  }

  if (session.user.role === "BROKER" && loan.brokerId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const documents = await db.document.findMany({
    where: { loanId: params.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(documents);
}
