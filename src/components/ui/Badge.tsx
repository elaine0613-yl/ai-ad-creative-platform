import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info";
  className?: string;
}

const variantStyles = {
  default: "bg-gray-100 text-gray-700",
  success: "bg-green-100 text-green-700",
  warning: "bg-yellow-100 text-yellow-700",
  error: "bg-red-100 text-red-700",
  info: "bg-blue-100 text-blue-700",
};

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", variantStyles[variant], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: BadgeProps["variant"] }> = {
    queued: { label: "排队中", variant: "default" },
    processing: { label: "生成中", variant: "info" },
    auditing: { label: "审核中", variant: "warning" },
    completed: { label: "已完成", variant: "success" },
    audit_failed: { label: "审核失败", variant: "error" },
    failed: { label: "失败", variant: "error" },
    passed: { label: "通过", variant: "success" },
    warning: { label: "警告", variant: "warning" },
    rejected: { label: "驳回", variant: "error" },
  };
  const config = map[status] ?? { label: status, variant: "default" as const };
  return <Badge variant={config.variant}>{config.label}</Badge>;
}
