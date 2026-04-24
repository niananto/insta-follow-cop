"use client";

import { useCallback } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { useFileProcessor } from "@/hooks/useFileProcessor";
import { FileUploadZone } from "@/components/FileUploadZone";
import { AnalysisResults } from "@/components/AnalysisResults";
import { DrivePickerButton } from "@/components/DrivePickerButton";
import { Button } from "@/components/ui/Button";

export default function UploadPage() {
  const { state, result, error, savedId, processFiles, saveResult, reset } =
    useFileProcessor();

  const handleFiles = useCallback(
    (files: FileList) => {
      processFiles(files);
    },
    [processFiles]
  );

  const handleSave = useCallback(async () => {
    await saveResult();
    if (savedId) {
      toast.success("Analysis saved!");
    }
  }, [saveResult, savedId]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Nav */}
      <nav className="border-b border-white/10 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl">🚔</span>
            <span className="font-bold text-white">Insta Follow Cop</span>
          </Link>
          <Link
            href="/results"
            className="text-sm text-gray-400 hover:text-white transition-colors"
          >
            History →
          </Link>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Upload your export
          </h1>
          <p className="text-gray-400">
            Drop your Instagram data export ZIP, or select the individual JSON
            files. Everything stays in your browser.
          </p>
        </div>

        {/* Upload zone */}
        {(state === "idle" ||
          state === "reading" ||
          state === "parsing" ||
          state === "error") && (
          <div className="space-y-4">
            <FileUploadZone onFiles={handleFiles} state={state} />

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-4 text-sm text-red-400">
                <strong>Error:</strong> {error}
              </div>
            )}

            <div className="flex items-center gap-4">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-xs text-gray-600">or</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>

            <div className="flex justify-center">
              <DrivePickerButton />
            </div>
          </div>
        )}

        {/* Results */}
        {result && state !== "error" && (
          <div className="space-y-6">
            <AnalysisResults
              result={result}
              onSave={handleSave}
              savedId={savedId}
              isSaving={state === "saving"}
              saveError={error ?? undefined}
            />

            <div className="flex justify-center pt-4">
              <Button variant="ghost" size="sm" onClick={reset}>
                ← Analyze another export
              </Button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
