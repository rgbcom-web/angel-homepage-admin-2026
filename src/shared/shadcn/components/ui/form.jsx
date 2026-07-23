'use client';

import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { Controller, FormProvider, useFormContext } from 'react-hook-form';

import { cn } from '@/shared/lib/utils';
import { Label } from '@/shared/shadcn/components/ui/label';
import { Button } from '@/shared/shadcn/components/ui/button';
import { Loader } from 'lucide-react';

const Form = FormProvider;

const FormFieldContext = React.createContext({});

const FormField = ({ ...props }) => {
  return (
    <FormFieldContext.Provider value={{ name: props.name }}>
      <Controller {...props} />
    </FormFieldContext.Provider>
  );
};

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};

const FormItemContext = React.createContext({});

const FormItem = React.forwardRef(({ className, ...props }, ref) => {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div ref={ref} className={cn('space-y-2', className)} {...props} />
    </FormItemContext.Provider>
  );
});
FormItem.displayName = 'FormItem';

const FormLabel = React.forwardRef(({ className, ...props }, ref) => {
  const { error, formItemId } = useFormField();

  return (
    <Label
      ref={ref}
      className={cn('font-medium', error && '', className)}
      htmlFor={formItemId}
      {...props}
    />
  );
});
FormLabel.displayName = 'FormLabel';

const FormControl = React.forwardRef(({ ...props }, ref) => {
  const { error, formItemId, formDescriptionId, formMessageId } = useFormField();

  return (
    <Slot
      ref={ref}
      id={formItemId}
      aria-describedby={!error ? `${formDescriptionId}` : `${formDescriptionId} ${formMessageId}`}
      aria-invalid={!!error}
      {...props}
    />
  );
});
FormControl.displayName = 'FormControl';

const FormDescription = React.forwardRef(({ className, ...props }, ref) => {
  const { formDescriptionId } = useFormField();

  return (
    <p
      ref={ref}
      id={formDescriptionId}
      className={cn('text-[0.8rem] text-muted-foreground', className)}
      {...props}
    />
  );
});
FormDescription.displayName = 'FormDescription';

const FormMessage = React.forwardRef(({ className, children, ...props }, ref) => {
  const { error, formMessageId } = useFormField();
  const body = error ? String(error?.message) : children;

  if (!body) {
    return null;
  }

  return (
    <p
      ref={ref}
      id={formMessageId}
      className={cn('text-[0.8rem] font-medium text-destructive', className)}
      {...props}
    >
      {body}
    </p>
  );
});
FormMessage.displayName = 'FormMessage';

const FieldBlock = ({
  control,
  name,
  label,
  render,
  className,
  vertical = true,
  autoFlex,
  required,
  description,
}) => {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem
          className={cn(
            'grid grid-cols-5 gap-x-3 gap-y-3 space-y-0',
            vertical && 'flex flex-col items-start',
            autoFlex && 'flex',
            className?.container,
          )}
        >
          {label && (
            <FormLabel
              className={cn(
                'col-span-1 flex h-9 items-center break-keep',
                vertical && 'col-span-full h-auto w-full items-end gap-2',
                autoFlex && 'flex-shrink-0',
                className?.label,
              )}
            >
              <span>{label}</span>
              {vertical && description && (
                <FormDescription className={cn('', className?.description)}>
                  ({description})
                </FormDescription>
              )}
            </FormLabel>
          )}
          <div
            className={cn(
              'col-span-4 w-full',
              vertical && 'col-span-full',
              !label && 'col-span-full',
              className?.content,
            )}
          >
            {render({ field })}
            {!vertical && description && (
              <FormDescription
                className={cn('col-span-full col-start-2 mt-1.5', className?.description)}
              >
                {description}
              </FormDescription>
            )}
            <FormMessage
              className={cn(
                'col-span-full col-start-2 mt-1',
                vertical && 'col-start-1',
                className?.message,
              )}
            />
          </div>
        </FormItem>
      )}
    />
  );
};

const Fieldset = ({ className, title, children, ...props }) => (
  <div className={cn('space-y-4', className?.container)} {...props}>
    {title && (
      <h3 className={cn('text-base font-semibold text-primary-dark', className?.title)}>{title}</h3>
    )}
    <div className={cn('space-y-6 pl-0.5', className?.content)}>{children}</div>
  </div>
);
Fieldset.displayName = 'Fieldset';

const FormSubmit = ({ children, ...props }) => {
  const {
    formState: { isValid, isSubmitting },
  } = useFormContext();

  const disabled = isSubmitting;

  return (
    <Button type="submit" disabled={disabled} {...props}>
      {isSubmitting ? <Loader className="h-4 w-4 animate-spin" /> : children}
    </Button>
  );
};

export {
  useFormField,
  Form,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
  FormField,
  FieldBlock,
  Fieldset,
  FormSubmit,
};
