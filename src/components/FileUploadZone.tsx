"use client";

import { useCallback, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { Spinner } from "./ui/Spinner";

interface FileUploadZoneProps {
  onFiles: (files: FileList) => void;
  state: "idle" | "reading" | "parsing" | "saving" | "done" | "error";
}

export function FileUploadZone({ onFiles, state }: FileUploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      if (e.dataTransfer.files.length) onFiles(e.dataTransfer.files);
    },
    [onFiles]
  );

  const isProcessing =
    state === "reading" || state === "parsing" || state === "saving";

  const statusText = {
    reading: "Reading file…",
    parsing: "Parsing your data…",
    saving: "Saving…",
    done: "Done!",
    error: "Something went wrong",
    idle: "",
  }[state];

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !isProcessing && inputRef.current?.click()}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-all duration-200",
        {
          "border-pink-500 bg-pink-500/10": dragging,
          "border-white/20 hover:border-pink-400 hover:bg-white/5 bg-white/[0.03]":
            !dragging && !isProcessing && state !== "error",
          "border-red-500/50 bg-red-500/5 cursor-default":
            state === "error",
          "border-purple-500/50 bg-purple-500/5 cursor-default": isProcessing,
          "border-green-500/50 bg-green-500/5": state === "done",
        }
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".zip,application/zip,application/json,.json"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && onFiles(e.target.files)}
      />

      {isProcessing ? (
        <>
          <Spinner className="h-10 w-10 text-purple-400 mb-4" />
          <p className="text-lg font-medium text-purple-300">{statusText}</p>
          <p className="text-sm text-gray-500 mt-1">Hang tight…</p>
        </>
      ) : state === "idle" || state === "error" ? (
        <>
          <div className="text-5xl mb-4">📦</div>
          <p className="text-lg font-semibold text-white mb-1">
            Drop your Instagram export here
          </p>
          <p className="text-sm text-gray-400 mb-4">
            Upload the <code className="text-pink-400">.zip</code> export, or
            drop both{" "}
            <code className="text-pink-400">followers_1.json</code> +{" "}
            <code className="text-pink-400">following.json</code> together
          </p>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <span>🔒</span> Processed entirely in your browser — we never see
              your data
            </span>
          </div>
        </>
      ) : (
        <>
          <div className="text-5xl mb-4">✅</div>
          <p className="text-lg font-semibold text-white">Parsed successfully</p>
          <p className="text-sm text-gray-400 mt-1">
            Scroll down to see results
          </p>
        </>
      )}
    </div>
  );
}
