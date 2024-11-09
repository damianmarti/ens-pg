import { Status } from "~~/services/database/repositories/stages";

const badgeBgColor: Record<Status, string> = {
  proposed: "bg-warning",
  rejected: "bg-error",
  completed: "bg-info",
  approved: "bg-success",
};

const badgeTextColor: Record<Status, string> = {
  proposed: "text-primary-orange",
  rejected: "text-primary-red",
  completed: "text-primary",
  approved: "text-primary-green",
};

type BadgeSize = "sm" | "md";

type BadgeProps = {
  status: Status;
  size?: BadgeSize;
  className?: string;
};

const badgeSizeClassNames: Record<BadgeSize, string> = {
  sm: "text-xs px-2 py-1.5",
  md: "text-sm px-4 py-1.5",
};

export const Badge = ({ status, size = "md", className = "" }: BadgeProps) => {
  const sizeClasses = badgeSizeClassNames[size];

  return (
    <div
      className={`badge font-bold rounded-lg capitalize h-auto ${badgeBgColor[status]} ${badgeTextColor[status]} ${sizeClasses} ${className}`}
    >
      {status}
    </div>
  );
};
