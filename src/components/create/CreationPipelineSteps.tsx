import { CREATION_PIPELINE_STEPS } from "@/lib/campaign/workflow";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface CreationPipelineStepsProps {
  currentIndex: number;
  className?: string;
}

export function CreationPipelineSteps({ currentIndex, className }: CreationPipelineStepsProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-x-1 gap-y-2", className)}>
      {CREATION_PIPELINE_STEPS.map((step, index) => (
        <div key={step} className="flex items-center gap-1">
          <div
            className={cn(
              "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-semibold",
              index < currentIndex
                ? "bg-brand-600 text-white"
                : index === currentIndex
                  ? "bg-brand-100 text-brand-700 ring-2 ring-brand-500"
                  : "bg-gray-100 text-gray-400"
            )}
          >
            {index < currentIndex ? <Check className="h-3 w-3" /> : index + 1}
          </div>
          <span
            className={cn(
              "text-xs",
              index <= currentIndex ? "font-medium text-gray-800" : "text-gray-400"
            )}
          >
            {step}
          </span>
          {index < CREATION_PIPELINE_STEPS.length - 1 && (
            <div
              className={cn("mx-1 h-px w-5", index < currentIndex ? "bg-brand-400" : "bg-gray-200")}
            />
          )}
        </div>
      ))}
    </div>
  );
}
