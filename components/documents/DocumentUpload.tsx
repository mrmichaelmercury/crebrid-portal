"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
  Upload,
  FileText,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  X,
  Eye,
} from "lucide-react";
import {
  REQUIRED_DOCS,
  OPTIONAL_DOCS,
  DOCUMENT_TYPE_LABELS,
} from "@/lib/types";
import type { LoanType, DocumentType } from "@/lib/types";
import { formatFileSize, formatDate } from "@/lib/utils";
import type { Loan, Document } from "@prisma/client";

type LoanWithDocs = Loan & { documents: Document[] };

interface Props {
  loan: LoanWithDocs;
  onUploaded: () => Promise<void>;
}

const STATUS_CONFIG = {
  PENDING: { icon: Clock, color: "text-yellow-500", label: "Processing" },
  PROCESSING: { icon: Loader2, color: "text-blue-500", label: "Processing", spin: true },
  APPROVED: { icon: CheckCircle2, color: "text-green-500", label: "Approved" },
  FLAGGED: { icon: AlertCircle, color: "text-orange-500", label: "Flagged" },
  REJECTED: { icon: X, color: "text-red-500", label: "Rejected" },
};

export default function DocumentUpload({ loan, onUploaded }: Props) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [expandedDoc, setExpandedDoc] = useState<string | null>(null);

  const requiredDocs = REQUIRED_DOCS[loan.loanType as LoanType] ?? [];
  const optionalDocs = OPTIONAL_DOCS[loan.loanType as LoanType] ?? [];
  const allExpectedDocs = [...requiredDocs, ...optionalDocs];
  const uploadedTypes = new Set(loan.documents.map((d) => d.documentType as DocumentType));

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;
      setUploading(true);
      setUploadError("");

      for (const file of acceptedFiles) {
        const formData = new FormData();
        formData.append("file", file);

        try {
          const res = await fetch(`/api/loans/${loan.id}/documents`, {
            method: "POST",
            body: formData,
          });

          if (!res.ok) {
            const data = (await res.json()) as { error?: string };
            setUploadError(data.error ?? "Upload failed");
          }
        } catch {
          setUploadError("Network error. Please try again.");
        }
      }

      setUploading(false);
      await onUploaded();
    },
    [loan.id, onUploaded]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
      "image/heic": [".heic"],
      "text/plain": [".txt"],
    },
    maxSize: 50 * 1024 * 1024,
    disabled: uploading,
  });

  const docsByType: Record<string, Document[]> = {};
  for (const doc of loan.documents) {
    const t = doc.documentType;
    if (!docsByType[t]) docsByType[t] = [];
    docsByType[t].push(doc);
  }

  const uncategorizedDocs = loan.documents.filter((d) => d.documentType === "OTHER");
  const miscDocs = loan.documents.filter(
    (d) => !allExpectedDocs.includes(d.documentType as DocumentType) && d.documentType !== "OTHER"
  );

  return (
    <div className="space-y-5">
      {/* Drop Zone */}
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
          isDragActive
            ? "border-crebrid-400 bg-crebrid-50"
            : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
        } ${uploading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center gap-2">
          {uploading ? (
            <Loader2 className="w-8 h-8 text-crebrid-500 animate-spin" />
          ) : (
            <Upload className={`w-8 h-8 ${isDragActive ? "text-crebrid-500" : "text-gray-300"}`} />
          )}
          <div>
            <p className="text-sm font-semibold text-gray-700">
              {uploading
                ? "Uploading..."
                : isDragActive
                  ? "Drop files here"
                  : "Drag & drop files, or tap to browse"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              PDF, JPG, PNG, WEBP, HEIC — up to 50MB each
            </p>
            <p className="text-xs text-gray-400">
              AI will automatically classify and extract data from each document
            </p>
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
          <p className="text-sm text-red-700">{uploadError}</p>
        </div>
      )}

      {/* Document Checklist */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-3">
          Required Documents Checklist
        </h3>
        <div className="space-y-1.5">
          {requiredDocs.map((docType) => {
            const docs = docsByType[docType] ?? [];
            const uploaded = docs.length > 0;
            return (
              <div
                key={docType}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  uploaded
                    ? "bg-green-50 border-green-100"
                    : "bg-white border-gray-100"
                }`}
              >
                {uploaded ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                ) : (
                  <Clock className="w-4 h-4 text-gray-300 flex-shrink-0" />
                )}
                <span
                  className={`text-sm flex-1 ${uploaded ? "text-green-800 font-medium" : "text-gray-500"}`}
                >
                  {DOCUMENT_TYPE_LABELS[docType]}
                </span>
                {uploaded && (
                  <span className="text-xs text-green-600">{docs.length} file{docs.length > 1 ? "s" : ""}</span>
                )}
                {!uploaded && (
                  <span className="text-xs text-red-400 font-medium">Required</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Uploaded Documents */}
      {loan.documents.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Uploaded Documents ({loan.documents.length})
          </h3>
          <div className="space-y-2">
            {loan.documents.map((doc) => {
              const statusCfg = STATUS_CONFIG[doc.status as keyof typeof STATUS_CONFIG];
              const StatusIcon = statusCfg.icon;
              const isExpanded = expandedDoc === doc.id;
              const flags = (doc.aiFlags as Array<{ severity: string; message: string }>) ?? [];
              const extractedData = doc.aiExtractedData as Record<string, unknown> | null;

              return (
                <div key={doc.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  <div
                    className="flex items-center gap-3 p-3 cursor-pointer hover:bg-gray-50"
                    onClick={() => setExpandedDoc(isExpanded ? null : doc.id)}
                  >
                    <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">{doc.fileName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-gray-400">
                          {DOCUMENT_TYPE_LABELS[doc.documentType as DocumentType] ?? doc.documentType}
                        </span>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400">{formatFileSize(doc.fileSize)}</span>
                        <span className="text-gray-200">·</span>
                        <span className="text-xs text-gray-400">{formatDate(doc.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <div className={`flex items-center gap-1 ${statusCfg.color}`}>
                        <StatusIcon
                          className={`w-4 h-4 ${(statusCfg as { spin?: boolean }).spin ? "animate-spin" : ""}`}
                        />
                        <span className="text-xs font-medium">{statusCfg.label}</span>
                      </div>
                      {flags.filter((f) => f.severity === "HIGH").length > 0 && (
                        <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-medium">
                          {flags.filter((f) => f.severity === "HIGH").length} flag{flags.filter((f) => f.severity === "HIGH").length > 1 ? "s" : ""}
                        </span>
                      )}
                      <Eye className="w-3.5 h-3.5 text-gray-300" />
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && doc.aiSummary && (
                    <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100 space-y-3">
                      <div>
                        <p className="text-xs font-semibold text-gray-500 mt-3 mb-1">AI Summary</p>
                        <p className="text-sm text-gray-700">{doc.aiSummary}</p>
                      </div>

                      {extractedData && Object.keys(extractedData).length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">Extracted Data</p>
                          <div className="grid grid-cols-2 gap-1.5">
                            {Object.entries(extractedData).slice(0, 12).map(([key, value]) => (
                              value != null && value !== "" ? (
                                <div key={key} className="bg-white rounded-lg p-2">
                                  <p className="text-xs text-gray-400 capitalize">{key.replace(/([A-Z])/g, " $1")}</p>
                                  <p className="text-xs font-medium text-gray-700 mt-0.5">
                                    {typeof value === "number"
                                      ? value > 1000
                                        ? `$${value.toLocaleString()}`
                                        : value.toString()
                                      : String(value)}
                                  </p>
                                </div>
                              ) : null
                            ))}
                          </div>
                        </div>
                      )}

                      {flags.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">Flags</p>
                          <div className="space-y-1.5">
                            {flags.map((flag, i) => (
                              <div
                                key={i}
                                className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                                  flag.severity === "HIGH"
                                    ? "bg-red-50 text-red-700"
                                    : flag.severity === "MEDIUM"
                                      ? "bg-yellow-50 text-yellow-700"
                                      : "bg-blue-50 text-blue-700"
                                }`}
                              >
                                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                                <span>{flag.message}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {doc.aiConfidence != null && (
                        <p className="text-xs text-gray-400">
                          AI Classification Confidence: {Math.round(doc.aiConfidence * 100)}%
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Optional Docs */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Optional Documents</h3>
        <div className="flex flex-wrap gap-1.5">
          {optionalDocs.map((docType) => {
            const uploaded = uploadedTypes.has(docType);
            return (
              <span
                key={docType}
                className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                  uploaded
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-500"
                }`}
              >
                {uploaded && "✓ "}
                {DOCUMENT_TYPE_LABELS[docType]}
              </span>
            );
          })}
        </div>
      </div>
    </div>
  );
}
