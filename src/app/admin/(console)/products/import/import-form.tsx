"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FileSpreadsheet, Upload, X, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { importProductsCsv } from "@/app/admin/actions";
import { CSV_TEMPLATE, parseCsvPreview } from "@/lib/csv";

type FileInfo = {
  name: string;
  size: number;
  rowCount: number;
  columns: string[];
  preview: string[][];
  content: string;
};

type ImportProgress = {
  phase: "parsing" | "importing" | "done" | "error";
  current: number;
  total: number;
  created: number;
  updated: number;
  failed: number;
  errors: string[];
};

export function ImportForm() {
  const router = useRouter();
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [progress, setProgress] = useState<ImportProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setProgress(null);
    
    try {
      let content = await file.text();
      if (content.charCodeAt(0) === 0xfeff) {
        content = content.slice(1);
      }
      content = content.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
      
      const { columns, rows, preview } = parseCsvPreview(content);
      
      if (!columns.length) {
        setError("Could not parse CSV headers. Please check the file format.");
        return;
      }
      
      setFileInfo({
        name: file.name,
        size: file.size,
        rowCount: rows,
        columns,
        preview,
        content,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to read file");
    }
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
      handleFile(file);
    } else {
      setError("Please drop a CSV file");
    }
  }, [handleFile]);

  const clearFile = () => {
    setFileInfo(null);
    setProgress(null);
    setError(null);
  };

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!fileInfo) return;

    setError(null);
    setProgress({
      phase: "importing",
      current: 0,
      total: fileInfo.rowCount,
      created: 0,
      updated: 0,
      failed: 0,
      errors: [],
    });

    const result = await importProductsCsv(fileInfo.content);
    
    if (!result.ok) {
      setProgress((prev) => prev ? {
        ...prev,
        phase: "error",
        errors: [result.error],
      } : null);
      setError(result.error);
      return;
    }

    setProgress({
      phase: "done",
      current: result.created + result.updated,
      total: fileInfo.rowCount,
      created: result.created,
      updated: result.updated,
      failed: 0,
      errors: [],
    });

    router.refresh();
  }

  function downloadTemplate() {
    const blob = new Blob([CSV_TEMPLATE], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "hearing-aid-models-template.csv";
    link.click();
    URL.revokeObjectURL(url);
  }

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const isImporting = progress?.phase === "importing";
  const isDone = progress?.phase === "done";

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={downloadTemplate}
          className="rounded-full border border-brand-border px-4 py-2 text-sm font-semibold hover:bg-brand-surface"
        >
          Download CSV template
        </button>
      </div>

      {!fileInfo ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="flex min-h-48 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-brand-border bg-brand-surface/50 p-8 transition-colors hover:border-brand-orange/50"
        >
          <FileSpreadsheet className="mb-4 h-12 w-12 text-brand-muted" />
          <p className="mb-2 text-center font-semibold text-brand-dark">
            Drag and drop your CSV file here
          </p>
          <p className="mb-4 text-center text-sm text-brand-muted">
            or click to browse
          </p>
          <label className="cursor-pointer rounded-full bg-brand-dark px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-dark/90">
            <Upload className="mr-2 inline-block h-4 w-4" />
            Choose CSV file
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
          </label>
        </div>
      ) : (
        <div className="rounded-3xl border border-brand-border bg-white p-6">
          <div className="mb-4 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-green-50">
                <FileSpreadsheet className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-brand-dark">{fileInfo.name}</p>
                <p className="text-sm text-brand-muted">
                  {formatSize(fileInfo.size)} · {fileInfo.rowCount} models · {fileInfo.columns.length} columns
                </p>
              </div>
            </div>
            {!isImporting && !isDone && (
              <button
                type="button"
                onClick={clearFile}
                className="rounded-full p-2 text-brand-muted hover:bg-brand-surface hover:text-brand-dark"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-muted">
              Detected columns
            </p>
            <div className="flex flex-wrap gap-1.5">
              {fileInfo.columns.map((col) => (
                <span
                  key={col}
                  className="rounded-full bg-brand-surface px-2.5 py-1 text-xs font-medium text-brand-dark"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          {fileInfo.preview.length > 0 && (
            <div className="mb-4">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-brand-muted">
                Preview (first 3 rows)
              </p>
              <div className="overflow-x-auto rounded-xl border border-brand-border">
                <table className="w-full text-xs">
                  <thead className="bg-brand-surface">
                    <tr>
                      {fileInfo.columns.slice(0, 6).map((col) => (
                        <th key={col} className="px-3 py-2 text-left font-semibold text-brand-dark">
                          {col}
                        </th>
                      ))}
                      {fileInfo.columns.length > 6 && (
                        <th className="px-3 py-2 text-left font-semibold text-brand-muted">
                          +{fileInfo.columns.length - 6} more
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {fileInfo.preview.map((row, i) => (
                      <tr key={i} className="border-t border-brand-border">
                        {row.slice(0, 6).map((cell, j) => (
                          <td key={j} className="max-w-32 truncate px-3 py-2 text-brand-muted">
                            {cell || "-"}
                          </td>
                        ))}
                        {fileInfo.columns.length > 6 && (
                          <td className="px-3 py-2 text-brand-muted">...</td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {progress && (
            <div className="mb-4 rounded-2xl bg-brand-surface p-4">
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {isImporting && <Loader2 className="h-4 w-4 animate-spin text-brand-orange" />}
                  {isDone && <CheckCircle className="h-4 w-4 text-green-600" />}
                  {progress.phase === "error" && <AlertCircle className="h-4 w-4 text-red-600" />}
                  <span className="text-sm font-semibold">
                    {isImporting && "Importing models..."}
                    {isDone && "Import complete!"}
                    {progress.phase === "error" && "Import failed"}
                  </span>
                </div>
                {(isImporting || isDone) && (
                  <span className="text-sm text-brand-muted">
                    {progress.current} / {progress.total}
                  </span>
                )}
              </div>
              
              {(isImporting || isDone) && (
                <div className="mb-3 h-2 overflow-hidden rounded-full bg-brand-border">
                  <div
                    className={`h-full transition-all duration-300 ${isDone ? "bg-green-500" : "bg-brand-orange"}`}
                    style={{ width: `${Math.round((progress.current / progress.total) * 100)}%` }}
                  />
                </div>
              )}

              {isDone && (
                <div className="flex gap-4 text-sm">
                  <span className="text-green-600">
                    <CheckCircle className="mr-1 inline-block h-3.5 w-3.5" />
                    {progress.created} created
                  </span>
                  <span className="text-blue-600">
                    {progress.updated} updated
                  </span>
                </div>
              )}

              {progress.errors.length > 0 && (
                <div className="mt-2 text-sm text-red-600">
                  {progress.errors.map((err, i) => (
                    <p key={i}>{err}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {error && !progress && (
        <div className="flex items-center gap-2 rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={isImporting || !fileInfo || isDone}
          className="rounded-full bg-brand-orange px-6 py-3 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-60"
        >
          {isImporting ? (
            <>
              <Loader2 className="mr-2 inline-block h-4 w-4 animate-spin" />
              Importing...
            </>
          ) : isDone ? (
            "Imported"
          ) : (
            `Import ${fileInfo?.rowCount ?? 0} models`
          )}
        </button>
        {isDone && (
          <button
            type="button"
            onClick={clearFile}
            className="rounded-full border border-brand-border px-6 py-3 text-sm font-semibold hover:bg-brand-surface"
          >
            Import another file
          </button>
        )}
      </div>
    </form>
  );
}
