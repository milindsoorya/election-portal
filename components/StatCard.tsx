import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: string;
  subtext?: string;
  className?: string;
  highlight?: boolean;
}

export default function StatCard({ label, value, icon, subtext, className, highlight }: StatCardProps) {
  return (
    <div className={cn(
      "bg-white rounded-xl p-5 border shadow-sm card-hover",
      highlight ? "border-kerala-green bg-gradient-to-br from-green-50 to-white" : "border-gray-100",
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-1">{label}</p>
          <p className={cn("text-2xl font-bold", highlight ? "text-kerala-green" : "text-gray-900")}>{value}</p>
          {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
        </div>
        <span className="text-3xl">{icon}</span>
      </div>
    </div>
  );
}
