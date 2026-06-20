"use client";

import { Button } from "@/components/ui/Button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { PageHeader } from "@/components/layout/PageHeader";
import { api } from "@/lib/api/client";
import { FileSpreadsheet, Upload, CheckCircle, AlertCircle } from "lucide-react";
import { useState } from "react";

type Step = "upload" | "validate" | "confirm" | "done";

interface ValidationResult {
  total: number;
  valid: number;
  items: Record<string, unknown>[];
  errors: { row: number; field: string; message: string }[];
}

export default function BatchPage() {
  const [step, setStep] = useState<Step>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setStep("validate");
    setError(null);
    try {
      const result = await api.batch.parse(f);
      setValidation(result as ValidationResult);
      setStep("confirm");
    } catch (err) {
      setError(err instanceof Error ? err.message : "解析失败");
      setStep("upload");
    }
  };

  const handleConfirm = async () => {
    if (!validation?.items.length) return;
    setSubmitting(true);
    try {
      await api.batch.submit(validation.items, file?.name?.replace(/\.\w+$/, ""));
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "提交失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <PageHeader title="批量生成" description="Excel 导入参数，大批量素材异步生成" />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-3xl space-y-6">
          <div className="flex items-center justify-center gap-4">
            {[
              { id: "upload", label: "上传文件" },
              { id: "validate", label: "参数校验" },
              { id: "confirm", label: "确认生成" },
              { id: "done", label: "任务创建" },
            ].map((s, i) => (
              <div key={s.id} className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${
                    step === s.id
                      ? "bg-brand-600 text-white"
                      : ["upload", "validate", "confirm", "done"].indexOf(step) >
                          ["upload", "validate", "confirm", "done"].indexOf(s.id)
                        ? "bg-brand-100 text-brand-700"
                        : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i + 1}
                </div>
                <span className="text-sm text-gray-600">{s.label}</span>
                {i < 3 && <div className="h-px w-8 bg-gray-200" />}
              </div>
            ))}
          </div>

          {error && <p className="rounded bg-red-50 p-3 text-sm text-red-600">{error}</p>}

          {step === "upload" && (
            <Card>
              <CardHeader>
                <CardTitle>上传参数文件</CardTitle>
                <CardDescription>下载 Excel 模板，填写产品/素材参数后上传</CardDescription>
              </CardHeader>
              <div className="space-y-4">
                <a href="/api/batch/parse" download="batch-template.xlsx">
                  <Button variant="outline" type="button">
                    <FileSpreadsheet className="h-4 w-4" />
                    下载 Excel 模板
                  </Button>
                </a>
                <label className="flex cursor-pointer flex-col items-center rounded-xl border-2 border-dashed border-gray-300 p-12 transition-colors hover:border-brand-400 hover:bg-brand-50/50">
                  <Upload className="h-10 w-10 text-gray-300" />
                  <p className="mt-3 text-sm font-medium text-gray-700">点击或拖拽上传 Excel 文件</p>
                  <p className="mt-1 text-xs text-gray-400">支持 .xlsx 格式，单次最多 500 条</p>
                  <input type="file" accept=".xlsx,.xls" className="hidden" onChange={handleUpload} />
                </label>
              </div>
            </Card>
          )}

          {step === "validate" && (
            <Card>
              <div className="flex flex-col items-center py-12">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-brand-600" />
                <p className="mt-4 text-sm text-gray-600">正在解析并校验参数...</p>
                {file && <p className="mt-1 text-xs text-gray-400">{file.name}</p>}
              </div>
            </Card>
          )}

          {step === "confirm" && validation && (
            <Card>
              <CardHeader>
                <CardTitle>校验结果</CardTitle>
                <CardDescription>
                  共 {validation.total} 条，有效 {validation.valid} 条，错误 {validation.errors.length} 条
                </CardDescription>
              </CardHeader>
              {validation.errors.length > 0 && (
                <div className="mb-4 space-y-2">
                  {validation.errors.map((err) => (
                    <div key={`${err.row}-${err.field}`} className="flex items-start gap-2 rounded-lg bg-red-50 p-3">
                      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                      <p className="text-sm text-red-700">
                        第 {err.row} 行 · {err.field}：{err.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => { setStep("upload"); setFile(null); setValidation(null); }}>
                  重新上传
                </Button>
                <Button loading={submitting} onClick={handleConfirm} disabled={validation.valid === 0}>
                  确认生成 {validation.valid} 条任务
                </Button>
              </div>
            </Card>
          )}

          {step === "done" && (
            <Card>
              <div className="flex flex-col items-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500" />
                <p className="mt-4 text-lg font-semibold text-gray-900">批量任务已创建</p>
                <p className="mt-1 text-sm text-gray-500">
                  {validation?.valid} 条任务已加入队列，可在任务中心查看进度
                </p>
                <div className="mt-6 flex gap-2">
                  <Button variant="outline" onClick={() => { setStep("upload"); setFile(null); setValidation(null); }}>
                    继续批量生成
                  </Button>
                  <Button onClick={() => { window.location.href = "/tasks"; }}>
                    前往任务中心
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
