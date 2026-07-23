'use client';
import * as React from 'react';
import PropTypes from 'prop-types';
import { cn } from '@/shared/lib/utils';
import { useImperativeHandle } from 'react';

export const useAutosizeTextArea = ({
  textAreaRef,
  triggerAutoSize,
  maxHeight = Number.MAX_SAFE_INTEGER,
  minHeight = 0,
}) => {
  const [init, setInit] = React.useState(true);
  React.useEffect(() => {
    const offsetBorder = 0;
    const textAreaElement = textAreaRef.current;
    if (textAreaElement) {
      if (init) {
        textAreaElement.style.minHeight = `${minHeight + offsetBorder}px`;
        if (maxHeight > minHeight) {
          textAreaElement.style.maxHeight = `${maxHeight}px`;
        }
        setInit(false);
      }
      textAreaElement.style.height = `${minHeight + offsetBorder}px`;
      const scrollHeight = textAreaElement.scrollHeight;
      if (scrollHeight > maxHeight) {
        textAreaElement.style.height = `${maxHeight}px`;
      } else {
        textAreaElement.style.height = `${scrollHeight + offsetBorder}px`;
      }
    }
  }, [textAreaRef.current, triggerAutoSize]);
};

export const AutosizeTextarea = React.forwardRef(
  (
    { maxHeight = Number.MAX_SAFE_INTEGER, minHeight = 36, className, onChange, value, ...props },
    ref,
  ) => {
    const textAreaRef = React.useRef(null);
    const [triggerAutoSize, setTriggerAutoSize] = React.useState('');

    useAutosizeTextArea({
      textAreaRef,
      triggerAutoSize: triggerAutoSize,
      maxHeight,
      minHeight,
    });

    useImperativeHandle(ref, () => ({
      textArea: textAreaRef.current,
      focus: () => textAreaRef?.current?.focus(),
      maxHeight,
      minHeight,
    }));

    React.useEffect(() => {
      setTriggerAutoSize(value);
    }, [props?.defaultValue, value]);

    return (
      <textarea
        {...props}
        value={value}
        ref={textAreaRef}
        className={cn(
          'flex w-full resize-none overflow-hidden rounded-md border border-input bg-transparent px-3 py-[0.35em] text-base shadow-sm placeholder:text-muted-foreground/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
        onChange={(e) => {
          setTriggerAutoSize(e.target.value);
          onChange?.(e);
        }}
      />
    );
  },
);

AutosizeTextarea.propTypes = {
  maxHeight: PropTypes.number,
  minHeight: PropTypes.number,
  className: PropTypes.string,
  onChange: PropTypes.func,
  value: PropTypes.string,
};

AutosizeTextarea.displayName = 'AutosizeTextarea';

export const renderAutuSizeValue = (value) => {
  return value?.endsWith('\n') ? value + '\u200B' : value;
};
