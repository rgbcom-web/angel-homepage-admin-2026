import { Button } from '@/shared/shadcn/components/ui/button';
import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex h-screen w-full items-center justify-center text-center">
      <div className="flex flex-col items-center">
        <h1 className="mb-[0.5em] text-6xl font-semibold">
          <span className="text-primary">404</span> NOT FOUND
        </h1>
        <p className="text-xl font-normal leading-[1.5]">존재하지 않는 페이지입니다.</p>
        <br />
        <br />
        <Button className="h-[2.5em] rounded-full text-xl" asChild size="lg" variant="outline">
          <Link href="/">홈으로 돌아가기</Link>
        </Button>
      </div>
    </div>
  );
}
