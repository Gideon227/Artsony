import { zodResolver } from '@hookform/resolvers/zod'
import {
  useForm as useRHF,
  type UseFormProps,
  type FieldValues,
  type DefaultValues,
} from 'react-hook-form'
import type { ZodType } from 'zod'

type UseFormOptions<T extends FieldValues> = Omit<UseFormProps<T>, 'resolver'> & {
  defaultValues?: DefaultValues<T>
}

export function useZodForm<T extends FieldValues>(
  schema: ZodType<T>,
  options?: UseFormOptions<T>
) {
  return useRHF<T>({
    ...options,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema as any),
    mode: options?.mode ?? 'onTouched',
  })
}

export { useController, useFieldArray, useWatch, useFormContext, FormProvider } from 'react-hook-form'
export type {
  FieldError,
  SubmitHandler,
  UseFormReturn,
  RegisterOptions,
} from 'react-hook-form'
