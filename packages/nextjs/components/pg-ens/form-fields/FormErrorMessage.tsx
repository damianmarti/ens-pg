type FormErrorMessageProps = {
  error?: string;
  className?: string;
};

export const FormErrorMessage = ({ error, className }: FormErrorMessageProps) => {
  return <div className={`text-primary-red mt-1 h-5 ${className}`}>{error}</div>;
};
