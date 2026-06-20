import { GENERATION_FLOW_STEPS } from "@/lib/constants";
import { Check } from "lucide-react";

interface FlowStepsProps {
  currentStep?: number;
}

export function FlowSteps({ currentStep = 0 }: FlowStepsProps) {
  return (
    <div className="flex items-center gap-2">
      {GENERATION_FLOW_STEPS.map((step, index) => (
        <div key={step} className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                index < currentStep
                  ? "bg-brand-600 text-white"
                  : index === currentStep
                    ? "bg-brand-100 text-brand-700 ring-2 ring-brand-600"
                    : "bg-gray-100 text-gray-400"
              }`}
            >
              {index < currentStep ? <Check className="h-3 w-3" /> : index + 1}
            </div>
            <span className={`text-xs ${index <= currentStep ? "text-gray-700" : "text-gray-400"}`}>{step}</span>
          </div>
          {index < GENERATION_FLOW_STEPS.length - 1 && (
            <div className={`h-px w-6 ${index < currentStep ? "bg-brand-600" : "bg-gray-200"}`} />
          )}
        </div>
      ))}
    </div>
  );
}
