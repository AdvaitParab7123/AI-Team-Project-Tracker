"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface Attachment {
  id: string;
  filename: string;
  filepath: string;
  mimetype: string;
  size: number;
  uploadedAt: string;
}

interface AttachmentsProps {
  taskId: string;
  attachments: Attachment[];
  onUpdate: () => void;
}

export function Attachments({ taskId, attachments, onUpdate }: AttachmentsProps) {
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (mimetype: string) => {
    if (mimetype.startsWith("image/")) {
      return (
        <svg
          className="w-5 h-5 text-blue-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      );
    }
    if (mimetype.includes("pdf")) {
      return (
        <svg
          className="w-5 h-5 text-red-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
          />
        </svg>
      );
    }
    return (
      <svg
        className="w-5 h-5 text-gray-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
        />
      </svg>
    );
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("taskId", taskId);

        await fetch("/api/attachments", {
          method: "POST",
          body: formData,
        });
      }
      onUpdate();
    } catch (error) {
      console.error("Failed to upload files:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleDelete = async (attachmentId: string) => {
    if (!confirm("Delete this attachment?")) return;

    try {
      const response = await fetch(`/api/attachments/${attachmentId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onUpdate();
      }
    } catch (error) {
      console.error("Failed to delete attachment:", error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Attachments</h3>
        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileSelect}
            className="hidden"
            multiple
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
          >
            {uploading ? (
              "Uploading..."
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                  />
                </svg>
                Add Attachment
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        {attachments.map((attachment) => (
          <div
            key={attachment.id}
            className="flex items-center gap-3 p-2 rounded-lg border hover:bg-gray-50 dark:hover:bg-gray-800 group"
          >
            {attachment.mimetype.startsWith("image/") ? (
              <img
                src={attachment.filepath}
                alt={attachment.filename}
                className="w-10 h-10 object-cover rounded"
              />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded">
                {getFileIcon(attachment.mimetype)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <a
                href={attachment.filepath}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium hover:underline truncate block"
              >
                {attachment.filename}
              </a>
              <p className="text-xs text-gray-500">
                {formatFileSize(attachment.size)} •{" "}
                {formatDistanceToNow(new Date(attachment.uploadedAt), {
                  addSuffix: true,
                })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 h-8 w-8 p-0 text-gray-400 hover:text-red-500"
              onClick={() => handleDelete(attachment.id)}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </Button>
          </div>
        ))}

        {attachments.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-4">
            No attachments yet. Click &quot;Add Attachment&quot; to upload files.
          </p>
        )}
      </div>
    </div>
  );
}
