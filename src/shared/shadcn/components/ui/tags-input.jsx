import * as React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/shared/shadcn/components/ui/badge';
import { Input } from '@/shared/shadcn/components/ui/input';
import { cn } from '@/shared/lib/utils';

const TagsInput = React.forwardRef(
  (
    { className, placeholder = 'Enter 키로 태그 추가', value = [], onChange, disabled, ...props },
    ref,
  ) => {
    const [inputValue, setInputValue] = React.useState('');
    const inputRef = React.useRef(null);

    const handleKeyDown = (e) => {
      if (e.nativeEvent.isComposing) {
        return;
      }

      if (e.key === 'Enter' && inputValue.trim()) {
        e.preventDefault();

        if (!value.includes(inputValue.trim())) {
          onChange([...value, inputValue.trim()]);
          setInputValue('');
        }
      }
    };

    const removeTag = (tagToRemove) => {
      onChange(value.filter((tag) => tag !== tagToRemove));
      inputRef.current?.focus();
    };

    return (
      <>
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          {...props}
        />
        {value.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {value.map((tag) => (
              <TagBadge key={tag} tag={tag} onRemove={removeTag} disabled={disabled} />
            ))}
          </div>
        )}
      </>
    );
  },
);

TagsInput.displayName = 'TagsInput';

function TagBadge({ tag, onRemove, disabled }) {
  if (!tag) return null;

  return (
    <Badge
      variant="secondary"
      className={cn('gap-0 py-1 pr-0', disabled ? 'cursor-not-allowed' : 'cursor-default')}
    >
      {tag}
      {!disabled && (
        <button
          type="button"
          onClick={() => onRemove(tag)}
          className="cursor-pointer px-2 py-0.5 text-muted-foreground hover:text-primary"
        >
          <X className="h-3 w-3" />
        </button>
      )}
    </Badge>
  );
}

export { TagsInput };
