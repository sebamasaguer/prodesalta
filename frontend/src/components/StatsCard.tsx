import type { ReactNode } from "react";

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: ReactNode;
}

export function StatsCard({ title, value, description, icon }: StatsCardProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-xl">
      {icon && <div className="mb-5 text-mundial-greenSoft">{icon}</div>}

      <p className="text-sm text-slate-300">{title}</p>

      <p className="mt-2 text-4xl font-black text-white">{value}</p>

      {description && (
        <p className="mt-2 text-sm leading-6 text-slate-400">
          {description}
        </p>
      )}
    </div>
  );
}