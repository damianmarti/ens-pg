type StatsItemProps = {
  value: number;
  description: string;
};

export const StatsItem = ({ value, description }: StatsItemProps) => {
  return (
    <div className="bg-white rounded-lg px-10 py-5 text-center w-full sm:w-44">
      <div className="text-primary text-3xl font-extrabold">{value}</div>
      <div className="font-semibold">{description}</div>
    </div>
  );
};
