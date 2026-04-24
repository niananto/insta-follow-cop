import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "pink" | "green" | "yellow" | "gray";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  className,
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        {
          "bg-white/10 text-gray-300": variant === "default",
          "bg-pink-500/20 text-pink-400": variant === "pink",
          "bg-green-500/20 text-green-400": variant === "green",
          "bg-yellow-500/20 text-yellow-400": variant === "yellow",
          "bg-gray-500/20 text-gray-400": variant === "gray",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
