import { zodResolver } from "@hookform/resolvers/zod";
import { FieldValues, useForm } from "react-hook-form";
import * as z from "zod";

export const getRequiredFields = (schema: z.AnyZodObject) => {
  const schemaShape = schema.shape;
  return Object.keys(schemaShape).filter(key => !schemaShape[key].isOptional());
};

export const useFormMethods = <FormValues extends FieldValues>({
  schema,
  defaultValues,
}: {
  schema: z.AnyZodObject;
  defaultValues?: any;
}) => {
  const formMethods = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues });

  const {
    formState: { errors },
  } = formMethods;

  const requiredFields = getRequiredFields(schema);

  const getCommonOptions = (name: keyof FormValues) => ({
    name,
    error: errors[name as string]?.message,
    required: requiredFields.includes(name as string),
  });

  return {
    getCommonOptions,
    formMethods,
  };
};
