type WorkflowItemProps = {
  step: number;
  title: string;
  description: string;
};

export const WorkflowItem = ({ step, title, description }: WorkflowItemProps) => {
  return (
    <div className="bg-white rounded-2xl p-6">
      <div className="flex gap-2 text-xl font-bold items-start">
        <div className="bg-primary text-white w-7 h-7 rounded-full inline-flex justify-center items-center flex-shrink-0">
          {step}
        </div>
        <div>{title}</div>
      </div>
      <div className="mt-4">{description}</div>
    </div>
  );
};
