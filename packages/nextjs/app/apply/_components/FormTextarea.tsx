import { DEFAULT_TEXTAREA_MAX_LENGTH } from "../consts";
import { FormValues } from "../schema";
import { FormErrorMessage } from "./FormErrorMessage";
import { useFormContext, useWatch } from "react-hook-form";

type FormTextareaProps = {
  label?: string;
  name: keyof FormValues;
  showMessageLength?: boolean;
  error?: string;
  required?: boolean;
};

export const FormTextarea = ({ error, label, name, showMessageLength, required }: FormTextareaProps) => {
  const { register, control } = useFormContext();
  const message = useWatch({ control, name });

  return (
    <div>
      <label>
        {label && (
          <span className="text-xl font-bold">
            {label}
            {required ? "*" : ""}
          </span>
        )}
        <textarea
          {...register(name)}
          className={`textarea mt-1 w-full${error ? " textarea-error" : ""}`}
          autoComplete="off"
          maxLength={DEFAULT_TEXTAREA_MAX_LENGTH}
        />
        {showMessageLength && (
          <div>
            {message?.length || 0} / {DEFAULT_TEXTAREA_MAX_LENGTH}
          </div>
        )}
      </label>
      <FormErrorMessage error={error} />
    </div>
  );
};
