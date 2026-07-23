'use client';

import { cn } from '@/shared/lib/utils';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem } from '@/shared/shadcn/components/ui/form';
import { Input } from '@/shared/shadcn/components/ui/input';
import { Button } from '@/shared/shadcn/components/ui/button';

import { useDaumPostcodePopup } from 'react-daum-postcode';
import { Map } from 'lucide-react';

export function AddressInput({
  postalCodeFieldName,
  addressFieldName = 'address',
  detailAddressFieldName = 'detail_address',
  sidoFieldName,
  sigunguFieldName,
}) {
  const form = useFormContext();
  const { setValue, setFocus } = form;
  const daumPostalPopup = useDaumPostcodePopup();

  const handleComplete = (data) => {
    const { roadAddress, jibunAddress, sido, sigungu } = data;

    if (data.userSelectedType === 'R') {
      setValue(addressFieldName, roadAddress, { shouldDirty: true });
    } else {
      setValue(addressFieldName, jibunAddress, { shouldDirty: true });
    }

    postalCodeFieldName && setValue(postalCodeFieldName, postalCode, { shouldDirty: true });
    sidoFieldName && setValue(sidoFieldName, sido, { shouldDirty: true });
    sigunguFieldName && setValue(sigunguFieldName, sigungu, { shouldDirty: true });

    setFocus(detailAddressFieldName);
  };

  const handleDaumPostalOpen = () => {
    daumPostalPopup({
      onComplete: handleComplete,
    });
  };

  return (
    <div className={cn('flex flex-col gap-2')}>
      <div className={cn('flex w-full items-center gap-1')}>
        <Button
          type="button"
          size=""
          variant="secondary"
          className={cn('flex-shrink-0 pl-3 text-xs')}
          onClick={handleDaumPostalOpen}
        >
          <Map className={cn('!size-3.5')} />
          주소찾기
        </Button>
        {postalCodeFieldName && (
          <FormField
            control={form.control}
            name={postalCodeFieldName}
            render={({ field }) => (
              <FormItem className={cn('w-[80px]')}>
                <Input
                  {...field}
                  placeholder="우편번호"
                  readOnly
                  className={cn('cursor-pointer !outline-none !ring-0')}
                  onClick={handleDaumPostalOpen}
                />
              </FormItem>
            )}
          />
        )}
        <FormField
          control={form.control}
          name={addressFieldName}
          render={({ field }) => (
            <FormItem className={cn('flex-1')}>
              <Input
                {...field}
                readOnly
                className={cn('cursor-pointer !outline-none !ring-0')}
                onClick={handleDaumPostalOpen}
              />
            </FormItem>
          )}
        />
      </div>
      <FormField
        control={form.control}
        name={detailAddressFieldName}
        render={({ field }) => (
          <FormItem>
            <Input {...field} placeholder="상세주소를 입력해주세요." />
          </FormItem>
        )}
      />
    </div>
  );
}
