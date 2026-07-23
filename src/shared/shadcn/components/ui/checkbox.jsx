'use client';

import * as React from 'react';
import * as CheckboxPrimitive from '@radix-ui/react-checkbox';
import { Check } from 'lucide-react';
import { cn } from '@/shared/lib/utils';
import { FormControl, FormField, FormItem, FormLabel } from './form';
import { buttonVariants } from './button';

const Checkbox = React.forwardRef(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      'peer h-4 w-4 shrink-0 rounded-sm border border-primary shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className={cn('flex items-center justify-center text-current')}>
      <Check className="h-4 w-4" />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = CheckboxPrimitive.Root.displayName;

const checkboxWithLabelClassNames = {
  container: 'inline-flex cursor-pointer items-center gap-2 space-y-0',
  label: 'cursor-pointer font-normal',
};

const CheckboxWithLabel = React.forwardRef(({ field, label, className, boxed, ...props }, ref) => {
  return (
    <FormLabel
      className={cn(
        checkboxWithLabelClassNames.container,
        boxed && buttonVariants({ variant: 'outline' }),
        boxed && 'pl-2.5',
        className,
      )}
    >
      <FormControl>
        <Checkbox checked={field.value} onCheckedChange={field.onChange} {...props} ref={ref} />
      </FormControl>
      <span className={checkboxWithLabelClassNames.label}>{label}</span>
    </FormLabel>
  );
});
CheckboxWithLabel.displayName = 'CheckboxWithLabel';

const CheckboxGroup = React.forwardRef(
  ({ control, name, options, className, boxed = true, ...props }, ref) => {
    return (
      <div className={cn('flex flex-wrap gap-2', className?.container)}>
        {options.map((option) => (
          <FormField
            key={option.label}
            control={control}
            name={name}
            render={({ field }) => (
              <FormItem key={option.label} className={cn('flex h-auto items-start space-y-0')}>
                <FormLabel
                  className={cn(
                    checkboxWithLabelClassNames.container,
                    boxed && buttonVariants({ variant: 'outline' }),
                    boxed && 'pl-2.5',
                  )}
                >
                  <FormControl>
                    <Checkbox
                      checked={field.value?.includes(option.value)}
                      onCheckedChange={(checked) => {
                        return checked
                          ? field.onChange(
                              Array.isArray(field.value)
                                ? [...field.value, option.value]
                                : [option.value],
                            )
                          : field.onChange(field.value?.filter((value) => value !== option.value));
                      }}
                      {...props}
                    />
                  </FormControl>
                  <span className={checkboxWithLabelClassNames.label}>{option.label}</span>
                </FormLabel>
              </FormItem>
            )}
          />
        ))}
      </div>
    );
  },
);
CheckboxGroup.displayName = 'CheckboxGroup';

export { Checkbox, CheckboxWithLabel, CheckboxGroup };
