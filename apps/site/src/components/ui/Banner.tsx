import { ReactNode } from 'react';

interface BannerProps {
  children?: ReactNode;
}

export default function Banner({ children }: BannerProps) {
  return (
    <div
      data-testid="banner"
      className="fixed top-0 left-0 right-0 z-50 flex h-4 text-center items-center justify-center w-full bg-eucalypt-600 px-4 text-sm font-bold text-white"
    >
      <p className="text-center w-full">{children}</p>
    </div>
  );
}
