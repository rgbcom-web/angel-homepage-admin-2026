import { cn } from '@/shared/lib/utils';

const style = {
  pulse: 'animate-pulse bg-secondary-dark/70',
  pulseDark: 'animate-pulse bg-secondary-dark/100',
  shimmer: 'skeleton-shimmer',
};

function Skeleton({ className, type = 'pulse', ...props }) {
  return <div className={cn(style[type], 'rounded', className)} {...props} />;
}

function ListSkeleton() {
  const SkeletonRow = ({ even }) => {
    const array = !even ? [100, 100, 100, 100] : [100, 80, 100, 100];

    return (
      <div className="grid grid-cols-[100px_1fr_150px_250px] gap-2 py-2">
        {array.map((width, index) => (
          <Skeleton
            key={index}
            className={`h-3 rounded-full`}
            style={{
              width: `${width}%`,
            }}
            type={
              even ? (index % 2 ? 'pulseDark' : undefined) : index % 2 ? undefined : 'pulseDark'
            }
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-3 w-24 rounded-full" />
      <div className="flex flex-col gap-1">
        <SkeletonRow />
        <SkeletonRow even />
        <SkeletonRow />
        <SkeletonRow even />
        <SkeletonRow />
        <SkeletonRow even />
        <SkeletonRow />
        <SkeletonRow even />
        <SkeletonRow />
        <SkeletonRow even />
        <SkeletonRow />
        <SkeletonRow even />
        <SkeletonRow />
        <SkeletonRow even />
        <SkeletonRow />
        <SkeletonRow even />
        <SkeletonRow />
        <SkeletonRow even />
        <SkeletonRow />
        <SkeletonRow even />
        <SkeletonRow />
        <SkeletonRow even />
        <SkeletonRow />
        <SkeletonRow even />
        <SkeletonRow />
        <SkeletonRow even />
        <SkeletonRow />
        <SkeletonRow even />
      </div>
    </div>
  );
}

function TextSkeleton() {
  const SkeletonRow = ({ array, delayAcc = 0, even }) => (
    <div className="flex gap-2">
      {array.map((width, index) => (
        <Skeleton
          key={index}
          className={`h-3 rounded-full`}
          style={{
            width: `${width}%`,
            animationDelay: `${index * 100 + delayAcc}ms`,
          }}
          type={even ? (index % 2 ? 'pulseDark' : undefined) : index % 2 ? undefined : 'pulseDark'}
        />
      ))}
    </div>
  );

  return (
    <div className="flex flex-col gap-2">
      <SkeletonRow array={[10]} delayAcc={0} />
      <span></span>
      <span></span>
      <SkeletonRow array={[100]} delayAcc={0} even />
      <SkeletonRow array={[5, 15, 25, 15, 5, 30]} delayAcc={50} />
      <SkeletonRow array={[20, 10, 30, 40, 5, 10]} delayAcc={100} even />
      <SkeletonRow array={[30, 5, 15, 25]} delayAcc={150} />
      <SkeletonRow array={[5, 15, 25, 35]} delayAcc={200} even />
      <span></span>
      <span></span>
      <SkeletonRow array={[10, 20, 5, 30, 10]} delayAcc={250} />
      <SkeletonRow array={[7, 10, 25, 5, 30]} delayAcc={300} even />
      <SkeletonRow array={[13, 50, 32]} delayAcc={350} />
      <SkeletonRow array={[24]} delayAcc={400} even />
      <span></span>
      <span></span>
      <SkeletonRow array={[30, 5, 15, 25]} delayAcc={150} />
      <SkeletonRow array={[5, 15, 25, 35]} delayAcc={200} even />
      <SkeletonRow array={[30, 5, 15, 25]} delayAcc={150} />
      <SkeletonRow array={[7, 10, 25, 5, 30]} delayAcc={300} even />
      <SkeletonRow array={[5, 15, 25, 15, 5, 30]} delayAcc={50} />
      <span></span>
      <span></span>
      <SkeletonRow array={[34]} delayAcc={400} even />
      <span></span>
      <span></span>
      <SkeletonRow array={[100]} delayAcc={0} even />
      <SkeletonRow array={[5, 15, 25, 15, 5, 30]} delayAcc={50} />
      <SkeletonRow array={[20, 10, 30, 40, 5, 10]} delayAcc={100} even />
      <SkeletonRow array={[30, 5, 15, 25]} delayAcc={150} />
      <SkeletonRow array={[5, 15, 25, 35]} delayAcc={200} even />
      <span></span>
      <span></span>
      <SkeletonRow array={[10, 20, 5, 30, 10]} delayAcc={250} />
      <SkeletonRow array={[7, 10, 25, 5, 30]} delayAcc={300} even />
      <SkeletonRow array={[13, 50, 32]} delayAcc={350} />
      <SkeletonRow array={[24]} delayAcc={400} even />
      <span></span>
      <span></span>
      <SkeletonRow array={[30, 5, 15, 25]} delayAcc={150} />
      <SkeletonRow array={[5, 15, 25, 35]} delayAcc={200} even />
    </div>
  );
}

function FormSkeleton({ rows = 4, includeHeader = true, includeSubmit = true }) {
  return (
    <div className="flex w-full max-w-3xl flex-col gap-6">
      {/* 폼 헤더 */}
      {includeHeader && (
        <div className="flex flex-col gap-2">
          <Skeleton className="h-6 w-1/3 rounded-full" />
          <Skeleton className="h-3 w-2/3 rounded-full" type="pulseDark" />
        </div>
      )}

      {/* 폼 필드들 */}
      <div className="flex flex-col gap-5">
        {Array.from({ length: rows }).map((_, i) => (
          <FormFieldSkeleton key={i} type={i % 3 === 0 ? 'textarea' : 'input'} even={i % 2 === 0} />
        ))}
      </div>

      {/* 제출 버튼 */}
      {includeSubmit && (
        <div className="mt-2 flex justify-end gap-3">
          <Skeleton className="h-9 w-24 rounded-md" type="pulseDark" />
          <Skeleton className="h-9 w-24 rounded-md" />
        </div>
      )}
    </div>
  );
}

function FormFieldSkeleton({ type = 'input', even = false }) {
  return (
    <div className="flex flex-col gap-2">
      {/* 라벨 */}
      <Skeleton
        className="h-3 rounded-full"
        style={{ width: `${Math.random() * 30 + 20}%` }}
        type={even ? 'pulseDark' : 'pulse'}
      />

      {/* 입력 필드 */}
      {type === 'input' && (
        <Skeleton className="h-10 w-full rounded-md" type={even ? 'pulse' : 'pulseDark'} />
      )}

      {/* 텍스트 에어리어 */}
      {type === 'textarea' && (
        <Skeleton className="h-28 w-full rounded-md" type={even ? 'pulse' : 'pulseDark'} />
      )}

      {/* 셀렉트 박스 */}
      {type === 'select' && (
        <Skeleton className="h-10 w-full rounded-md" type={even ? 'pulse' : 'pulseDark'} />
      )}

      {/* 체크박스/라디오 그룹 */}
      {type === 'checkbox-group' && (
        <div className="flex flex-col gap-2 pl-1">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded" type={even ? 'pulseDark' : 'pulse'} />
              <Skeleton
                className="h-3 rounded-full"
                style={{ width: `${Math.random() * 40 + 20}%` }}
                type={even ? 'pulse' : 'pulseDark'}
              />
            </div>
          ))}
        </div>
      )}

      {/* 도움말 텍스트 */}
      {Math.random() > 0.7 && (
        <Skeleton
          className="mt-1 h-2 rounded-full"
          style={{ width: `${Math.random() * 50 + 30}%` }}
          type={even ? 'pulse' : 'pulseDark'}
        />
      )}
    </div>
  );
}

// 다양한 형태의 미리 정의된 폼 스켈레톤들
function LoginFormSkeleton() {
  return (
    <div className="flex w-full max-w-sm flex-col gap-6 p-6">
      <div className="mb-2 flex justify-center">
        <Skeleton className="h-8 w-36 rounded-full" />
      </div>

      <FormFieldSkeleton type="input" even={false} />
      <FormFieldSkeleton type="input" even={true} />

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-3 w-24 rounded-full" type="pulseDark" />
        </div>
        <Skeleton className="h-3 w-28 rounded-full" />
      </div>

      <Skeleton className="mt-4 h-10 w-full rounded-md" type="pulseDark" />

      <div className="mt-2 flex justify-center">
        <Skeleton className="h-3 w-40 rounded-full" />
      </div>
    </div>
  );
}

function SignupFormSkeleton() {
  return (
    <div className="flex w-full max-w-md flex-col gap-5 p-6">
      <div className="mb-2 flex flex-col gap-2">
        <Skeleton className="h-7 w-48 rounded-full" />
        <Skeleton className="h-3 w-72 rounded-full" type="pulseDark" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <FormFieldSkeleton type="input" even={false} />
        <FormFieldSkeleton type="input" even={true} />
      </div>

      <FormFieldSkeleton type="input" even={false} />
      <FormFieldSkeleton type="input" even={true} />
      <FormFieldSkeleton type="checkbox-group" even={false} />

      <Skeleton className="mt-2 h-11 w-full rounded-md" />

      <div className="mt-2 flex justify-center">
        <Skeleton className="h-3 w-56 rounded-full" type="pulseDark" />
      </div>
    </div>
  );
}

export {
  Skeleton,
  ListSkeleton,
  TextSkeleton,
  FormSkeleton,
  FormFieldSkeleton,
  LoginFormSkeleton,
  SignupFormSkeleton,
};
