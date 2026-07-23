'use client';

import * as React from 'react';
import * as RadioGroupPrimitive from '@radix-ui/react-radio-group';
import { Circle } from 'lucide-react';
import { FormLabel, FormControl, FormItem } from './form';
import { cn } from '@/shared/lib/utils';
import { buttonVariants } from './button';

const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
  return <RadioGroupPrimitive.Root className={cn('grid gap-2', className)} {...props} ref={ref} />;
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;

const RadioGroupItem = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <RadioGroupPrimitive.Item
      ref={ref}
      className={cn(
        'aspect-square h-4 w-4 rounded-full border text-primary focus:border-primary focus:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:!border-primary data-[state=unchecked]:border-gray-300',
        className,
      )}
      {...props}
    >
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="!h-2.5 !w-2.5 fill-primary" />
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>
  );
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;

const RadioSet = ({ options, field, groupProps, itemProps, boxed = true }) => {
  return (
    <RadioGroup
      onValueChange={(val) => field.onChange(JSON.parse(val))}
      value={field.value ? JSON.stringify(field.value) : JSON.stringify(options[0].value)}
      className={cn('flex flex-wrap gap-2')}
      {...groupProps}
    >
      {options.map((option) => (
        <FormItem key={option.label}>
          <FormLabel
            className={cn(
              'flex cursor-pointer items-center gap-2 space-y-0',
              boxed && buttonVariants({ variant: 'outline' }),
              option.disabled && 'pointer-events-none opacity-50',
              'pl-2.5',
            )}
          >
            <FormControl>
              <RadioGroupItem
                value={JSON.stringify(option.value)}
                {...itemProps}
                disabled={option.disabled}
              />
            </FormControl>
            <span className="cursor-pointer font-normal">{option.label}</span>
          </FormLabel>
        </FormItem>
      ))}
    </RadioGroup>
  );
};
RadioSet.displayName = RadioGroupPrimitive.Root.displayName;

export { RadioGroup, RadioGroupItem, RadioSet };
