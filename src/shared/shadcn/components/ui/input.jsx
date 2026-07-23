import * as React from 'react';

import { cn } from '@/shared/lib/utils';
import { FormControl } from '@/shared/shadcn/components/ui/form';
import { Button } from '@/shared/shadcn/components/ui/button';
import { Checkbox } from './checkbox';
import { useFormField } from '@/shared/shadcn/components/ui/form';
import { useFormContext } from 'react-hook-form';
import { convertFileSize } from '@/shared/lib/files.utils';

const inputClassName =
  'border-input placeholder:text-muted-foreground/50 focus-visible:ring-ring flex h-9 w-full rounded-md border bg-transparent px-3 py-1 transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground focus-visible:outline-none focus-visible:ring-1 disabled:cursor-not-allowed disabled:opacity-50 text-sm';

const Input = React.forwardRef(
  (
    {
      className,
      type = 'text',
      ghost,
      size,
      noFormControl,
      customfilter,
      useTrim = true,
      ...props
    },
    ref,
  ) => {
    let realType = type;

    if (['int', 'decimal'].includes(type)) {
      realType = 'text';
    }

    const handleChange = (e) => {
      let filteredValue = e.target.value;

      if (type === 'int') {
        filteredValue = intFilter(filteredValue);
      } else if (type === 'decimal') {
        filteredValue = decimalFilter(filteredValue);
      }

      if (customfilter) {
        filteredValue = customfilter(filteredValue);
      }

      // props.onChange가 있으면 필터링된 값으로 호출
      if (props.onChange) {
        const syntheticEvent = { ...e, target: { ...e.target, value: filteredValue } };
        props.onChange(syntheticEvent);
      }
    };

    const handleBlur = (e) => {
      if (useTrim && !['int', 'decimal'].includes(type)) {
        e.target.value = e.target.value.trim();

        if (props.onChange) {
          const syntheticEvent = { ...e, target: { ...e.target, value: e.target.value } };
          props.onChange(syntheticEvent);
        }
      }
    };

    const Comp = () => (
      <input
        type={realType}
        className={cn(
          !ghost && inputClassName,
          ghost &&
            '!border-0 !bg-transparent !p-0 !outline-none !ring-0 focus:!border-0 focus:!outline-none focus:!ring-0',
          size === 'sm' && 'h-8',
          className,
        )}
        ref={ref}
        {...props}
        value={['', null, undefined].includes(props.value) ? '' : props.value}
        onChange={handleChange}
        onBlur={handleBlur}
      />
    );

    if (noFormControl) {
      return Comp();
    }

    return <FormControl>{Comp()}</FormControl>;
  },
);
Input.displayName = 'Input';

const FileInput = React.forwardRef(({ className, noFormControl, value, ...props }, ref) => {
  const [fileInfo, setFileInfo] = React.useState(null);
  const fileInputRef = React.useRef(null);

  React.useEffect(() => {
    if (!value) {
      setFileInfo(null);
    }
  }, [value]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setFileInfo({
        name: file.name,
        size: convertFileSize(file.size),
      });
      if (props.onChange) {
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: file,
          },
        };
        props.onChange(syntheticEvent);
      }
    } else {
      setFileInfo(null);
      if (props.onChange) {
        const syntheticEvent = {
          ...e,
          target: {
            ...e.target,
            value: undefined,
          },
        };
        props.onChange(syntheticEvent);
      }
    }
  };

  const cancelUpload = (e) => {
    e.preventDefault();

    setFileInfo(null);

    // 파일 input 요소의 value 초기화
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    if (props.onChange) {
      props.onChange({ target: { value: null } });
    }
  };

  const Comp = () => (
    <label className={cn(inputClassName, 'flex flex-col gap-2 pl-1 pr-1')}>
      <input
        type="file"
        className="hidden"
        ref={(el) => {
          fileInputRef.current = el;
          if (typeof ref === 'function') ref(el);
          else if (ref) ref.current = el;
        }}
        {...props}
        onChange={handleFileChange}
      />
      <div className="flex h-full items-center gap-2">
        <Button
          type="button"
          variant="secondary"
          size="xs"
          onClick={() => fileInputRef.current?.click()}
        >
          파일 선택
        </Button>
        {fileInfo ? (
          <div className="flex w-full gap-2 text-sm text-muted-foreground">
            <span className="line-clamp-1 font-medium">{fileInfo.name}</span>
            <small className="flex-shrink-0">({fileInfo.size})</small>
          </div>
        ) : (
          <span className="text-sm text-muted-foreground">선택된 파일 없음</span>
        )}
        {fileInfo && (
          <Button type="button" variant="secondary" size="xs" onClick={cancelUpload}>
            취소
          </Button>
        )}
      </div>
    </label>
  );

  if (noFormControl) {
    return Comp();
  }

  return (
    <FormControl>
      <div>
        {Comp()} <PrevFile />
      </div>
    </FormControl>
  );
});

FileInput.displayName = 'FileInput';

const PrevFile = React.forwardRef(({ className }, ref) => {
  const { getValues, setValue } = useFormContext();
  const field = useFormField();
  const fieldName = field.name.split('files.').pop();
  const fieldValue = getValues(fieldName);
  const [deleteFile, setDeleteFile] = React.useState(false);

  const handleCheckboxChange = (checked) => {
    setDeleteFile(checked);
    setValue(`${fieldName}.deleted`, checked);
  };

  if (!fieldValue) return null;

  return (
    <div className={cn('mt-2 flex items-center justify-end gap-4', className?.root)}>
      <span
        className={cn('line-clamp-1 text-right text-xs', deleteFile && 'text-red-500 line-through')}
      >
        기존파일 : {fieldValue.originalName}
      </span>
      <label className={cn('flex flex-shrink-0 items-center gap-1')}>
        <Checkbox className={cn('h-4 w-4')} onCheckedChange={handleCheckboxChange} />
        <span className={cn('text-xs')}>삭제</span>
      </label>
    </div>
  );
});

PrevFile.displayName = 'PrevFile';

export { Input, inputClassName, FileInput, PrevFile };

function intFilter(value) {
  value = value.trim();
  value = value.replace(/[^0-9]/g, '');

  if (value.length > 1 && value.startsWith('0') && value[1] !== '.') {
    value = value.replace(/^0+/, '') || '0';
  }

  return parseInt(value) || 0;
}

function decimalFilter(value) {
  value = value.trim();
  value = value.replace(/[^0-9.]/g, '');

  const parts = value.split('.');
  value = parts[0] + (parts.length > 1 ? '.' + parts[1] : '');

  if (value.length > 1 && value.startsWith('0') && value[1] !== '.') {
    value = value.replace(/^0+/, '') || '0';
  }

  return value;
}
