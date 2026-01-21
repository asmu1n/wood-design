import { DefaultValues, FieldValues, Path, UseFormReturn } from 'react-hook-form';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import UploadFile from './UploadFile';
import { FormItemConfig } from './AuthForm';
import { cn } from '@/utils/common';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';

export interface FlexFormProps<T extends FieldValues> {
    schema: z.ZodType<T>;
    formConfig: FormItemConfig<T>[];
    onSubmit: (data: T) => any;
    parentClass?: string;
    formItemClass?: string;
    formLabelClass?: string;
    formInputClass?: string;
    width?: string | number;
    button?: SubmitButtonProps;
}

/**
 * Render a configurable form bound to a Zod schema and a declarative field configuration.
 *
 * Renders form fields described by `formConfig`, applies validation from `schema`, and calls
 * `onSubmit` with the form data when submitted. Supports custom field slots, file/image uploads,
 * textarea and default input types, and accepts optional class overrides and a submit button config.
 *
 * @param schema - Zod schema used for form validation and parsing
 * @param formConfig - Array of field configuration objects describing keys, labels, types, defaults, descriptions, options, and optional custom slots
 * @param button - Configuration for the submit control (content, disabled state, or replacement rendering)
 * @param onSubmit - Callback invoked with the form data when the form is submitted
 * @param width - Optional CSS width for the form; when a number is provided it is treated as pixels
 * @param formClass - Optional object of CSS class names to customize parent, item, label, and input styling
 * @returns The rendered form element configured according to the provided schema and formConfig
 */
export default function FlexForm<T extends FieldValues>({ schema, formConfig, button, onSubmit, width, ...formClass }: FlexFormProps<T>) {
    const defaultValues = {} as DefaultValues<T>;

    formConfig.forEach(item => {
        defaultValues[item.key as keyof DefaultValues<T>] = item?.value || '';
    });
    const form: UseFormReturn<T> = useForm({
        resolver: zodResolver(schema),
        defaultValues: defaultValues
    });

    async function onSubmitHandler(data: T) {
        try {
            await onSubmit(data);

            form.reset();
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <Form style={{ width: typeof width === 'number' ? width + 'px' : width || '' }} {...form} onSubmit={form.handleSubmit(onSubmitHandler)}>
            <div style={{ width: typeof width === 'number' ? width + 'px' : width }} className={cn(formClass?.parentClass)}>
                {formConfig?.map(({ key, label, options, description, type, slot }) => (
                    <FormField
                        key={key as string}
                        control={form.control}
                        name={key as keyof T as Path<T>}
                        render={({ field }) => {
                            const renderFormItem = (Field: typeof field, Options: typeof options) => {
                                if (slot) {
                                    return slot(Field, Options);
                                } else {
                                    switch (type) {
                                        case 'image': {
                                            return (
                                                <UploadFile
                                                    variant={formClass?.formInputClass?.includes('dark') ? 'dark' : 'light'}
                                                    type={type}
                                                    {...Field}
                                                    {...Options}
                                                    onFileChange={field.onChange}
                                                />
                                            );
                                        }

                                        case 'file': {
                                            return (
                                                <UploadFile
                                                    variant={formClass?.formInputClass?.includes('dark') ? 'dark' : 'light'}
                                                    type={type}
                                                    {...Field}
                                                    {...Options}
                                                    onFileChange={field.onChange}
                                                />
                                            );
                                        }

                                        case 'textarea': {
                                            return <Textarea {...Field} {...Options}></Textarea>;
                                        }

                                        default: {
                                            return (
                                                <Input
                                                    type={type || 'text'}
                                                    {...Field}
                                                    {...Options}
                                                    className={cn(
                                                        formClass?.formInputClass?.includes('dark') && 'form-input',
                                                        formClass?.formInputClass
                                                    )}
                                                />
                                            );
                                        }
                                    }
                                }
                            };

                            return (
                                <FormItem className={cn(formClass?.formItemClass)}>
                                    <FormLabel className={cn(formClass?.formLabelClass ? formClass?.formLabelClass : 'capitalize')}>
                                        {label}
                                    </FormLabel>
                                    <FormControl>{renderFormItem(field, options)}</FormControl>
                                    <FormDescription>{description || ''}</FormDescription>
                                    <FormMessage />
                                </FormItem>
                            );
                        }}
                    />
                ))}

                <div className="text-center">
                    <FlexForm.SubmitButton {...button} />
                </div>
            </div>
        </Form>
    );
}

interface SubmitButtonProps {
    children?: React.ReactNode;
    disabled?: boolean;
    replace?: boolean;
}

FlexForm.SubmitButton = function FormSubmitButton({ children, disabled, replace }: SubmitButtonProps) {
    return (
        <>
            {replace ? (
                children
            ) : (
                <Button type="submit" className="" disabled={disabled}>
                    {children || '确定'}
                </Button>
            )}
        </>
    );
};