import { FormErrorMessage } from "./FormErrorMessage";
import { useFormContext, useWatch } from "react-hook-form";

type FormSelectProps = {
  label?: string;
  name: string;
  error?: string;
  required?: boolean;
  options: string[];
};

export const FormSelect = ({ error, label, name, required, options }: FormSelectProps) => {
  const { register, control } = useFormContext();
  useWatch({ control, name });

  return (
    <div>
      <label>
        {label && (
          <span className="text-xl font-bold">
            {label}
            {required ? "*" : ""}
          </span>
        )}
        <select
          {...register(name)}
          className={`block select select-bordered mt-1 w-full max-w-xs${error ? " select-error" : ""}`}
          autoComplete="off"
        >
          {options?.map(opt => (
            <option key={opt}>{opt}</option>
          ))}
        </select>
      </label>
      <FormErrorMessage error={error} />
    </div>
  );
};
