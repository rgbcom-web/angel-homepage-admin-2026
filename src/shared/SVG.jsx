import { cn } from '@/shared/lib/utils';

export function Logo({ className }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="43.851"
      height="39.915"
      viewBox="0 0 43.851 39.915"
      className={cn(className)}
    >
      <path
        d="M22.215,0A21.95,21.95,0,0,0,.29,21.925a17.99,17.99,0,0,0,35.979,0H28.4a10.119,10.119,0,0,1-20.237,0,14.054,14.054,0,1,1,28.108,0h7.871A21.95,21.95,0,0,0,22.215,0Z"
        transform="translate(-0.29)"
        fill="currentColor"
      />
      <path
        d="M190.181,156.58H182.31v7.871h7.871Z"
        transform="translate(-146.331 -125.629)"
        fill="currentColor"
      />
    </svg>
  );
}
