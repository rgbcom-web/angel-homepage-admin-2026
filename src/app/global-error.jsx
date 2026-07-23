'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from 'react-day-picker';
import Link from 'next/link';

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    console.error('에러페이지', error);
  }, [error]);

  return (
    <html>
      <body>
        <div className="flex h-screen w-full items-center justify-center text-center">
          <div className="flex flex-col items-center">
            <h1 className="mb-[0.5em] text-6xl font-semibold">
              <span className="text-primary">404</span> NOT FOUND
            </h1>
            <p className="text-xl font-normal leading-[1.5]">
              어플리케이션에서 오류가 발생하였습니다. <br />
              아래 버튼을 클릭하여 다시 시도하거나 홈으로 돌아가세요.
            </p>
            <br />
            <br />
            <nav className={'flex gap-2'}>
              <Button
                onClick={() => reset()}
                className="h-[2.5em] rounded-full text-xl"
                size="lg"
                variant="defaultLight"
              >
                다시 시도하기
              </Button>
              <Button
                className="h-[2.5em] rounded-full text-xl"
                asChild
                size="lg"
                variant="outline"
              >
                <Link href="/">홈으로 돌아가기</Link>
              </Button>
            </nav>
          </div>
        </div>
      </body>
    </html>
  );
}
