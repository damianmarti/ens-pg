import { DEFAULT_INPUT_MAX_LENGTH } from "../consts";
import { FormValues } from "../schema";
import { FormErrorMessage } from "./FormErrorMessage";
import { useFormContext, useWatch } from "react-hook-form";

type FormInputProps = {
  label?: string;
  name: keyof FormValues;
  error?: string;
  required?: boolean;
};

export const FormInput = ({ error, label, name, required }: FormInputProps) => {
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
        <input
          {...register(name)}
          className={`input mt-1 w-full${error ? " input-error" : ""}`}
          autoComplete="off"
          maxLength={DEFAULT_INPUT_MAX_LENGTH}
        />
      </label>
      <FormErrorMessage error={error} />
    </div>
  );
};
