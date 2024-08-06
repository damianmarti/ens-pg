type FormErrorMessageProps = {
  error?: string;
};

export const FormErrorMessage = ({ error }: FormErrorMessageProps) => {
  return <div className="text-primary-red mt-1 h-5">{error}</div>;
};
