import localFont from 'next/font/local';

const pretendard = localFont({
  src: [
    {
      path: 'pretendard/Thin.woff2',
      weight: '100',
    },
    {
      path: 'pretendard/ExtraLight.woff2',
      weight: '200',
    },
    {
      path: 'pretendard/Light.woff2',
      weight: '300',
    },
    {
      path: 'pretendard/Regular.woff2',
      weight: '400',
    },
    {
      path: 'pretendard/Medium.woff2',
      weight: '500',
    },
    {
      path: 'pretendard/SemiBold.woff2',
      weight: '600',
    },
    {
      path: 'pretendard/Bold.woff2',
      weight: '700',
    },
    {
      path: 'pretendard/ExtraBold.woff2',
      weight: '800',
    },
    {
      path: 'pretendard/Black.woff2',
      weight: '900',
    },
  ],
  display: 'swap',
  variable: '--font-primary',
});

export { pretendard };
