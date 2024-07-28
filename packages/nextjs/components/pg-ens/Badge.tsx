import { Status } from "~~/services/database/repositories/stages";

const badgeBgColor: Record<Status, string> = {
  proposed: "bg-warning",
  rejected: "bg-error",
  completed: "bg-info",
  approved: "bg-success",
};

export const badgeTextColor: Record<Status, string> = {
  proposed: "text-primary-orange",
  rejected: "text-primary-red",
  completed: "text-primary",
  approved: "text-primary-green",
};

type BadgeProps = {
  status: Status;
};

export const Badge = ({ status }: BadgeProps) => {
  return (
    <div
      className={`px-4 py-1.5 m-0 h-auto capitalize font-bold badge rounded-lg ${badgeBgColor[status]} ${badgeTextColor[status]} max-w-fit`}
    >
      {status}
    </div>
  );
};
