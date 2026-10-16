import { type LucideIcon } from "lucide-react";

interface StatBarProps {
  stats: {
    label: string;
    value: string | number;
    icon: LucideIcon;
    color?: string;
  }[];
}

export function StatBar({ stats }: StatBarProps) {
  return (
    <div className="grid grid-cols-3 gap-3">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <div
            key={stat.label}
            className="card p-3 flex flex-col items-center text-center"
          >
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${stat.color || "bg-amber-100"}`}
            >
              <Icon
                className={`w-4.5 h-4.5 ${stat.color ? "text-white" : "text-amber-600"}`}
              />
            </div>
            <p className="text-lg font-bold text-navy-900 leading-tight">
              {stat.value}
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5 leading-tight">
              {stat.label}
            </p>
          </div>
        );
      })}
    </div>
  );
}
