interface StatsCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: "accent" | "cyan" | "success" | "warning";
  delay?: number;
}

const colorMap = {
  accent:  { bg: "bg-accent/8",  text: "text-accent",  shadow: "shadow-[0_4px_12px_rgba(124,58,237,0.08)]" },
  cyan:    { bg: "bg-cyan/8",    text: "text-cyan",     shadow: "shadow-[0_4px_12px_rgba(8,145,178,0.08)]" },
  success: { bg: "bg-success/8", text: "text-success",  shadow: "shadow-[0_4px_12px_rgba(5,150,105,0.08)]" },
  warning: { bg: "bg-warning/8", text: "text-warning",  shadow: "shadow-[0_4px_12px_rgba(217,119,6,0.08)]" },
};

export default function StatsCard({ icon, label, value, color, delay = 0 }: StatsCardProps) {
  const c = colorMap[color];
  return (
    <div
      className="glass-card p-6 animate-fade-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl ${c.bg} ${c.shadow} flex items-center justify-center ${c.text}`}>
          {icon}
        </div>
      </div>
      <p className="text-3xl font-bold tracking-tight mb-1">{value}</p>
      <p className="text-sm text-muted">{label}</p>
    </div>
  );
}
