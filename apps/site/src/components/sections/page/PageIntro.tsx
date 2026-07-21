import { cn } from '@/lib/cn';

interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  align?: 'center' | 'left';
  className?: string;
  titleAs?: 'h1' | 'h2';
}

export function PageIntro({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
  titleAs: TitleTag = 'h2',
}: PageIntroProps) {
  return (
    <section className={cn('py-16 sm:py-24', className)}>
      <div
        className={cn(
          'mx-auto px-6 lg:px-14',
          align === 'center' ? 'max-w-[820px] text-center' : 'max-w-[1240px]',
        )}
      >
        <p className="text-[13px] font-semibold uppercase tracking-[0.24em] text-bracken-500">
          {eyebrow}
        </p>
        <TitleTag
          className={cn(
            'mt-3.5 font-heading text-[40px] font-normal leading-[1.14] text-eucalypt-600 text-balance sm:text-[44px]',
            align === 'left' && 'max-w-3xl',
          )}
        >
          {title}
        </TitleTag>
        <p
          className={cn(
            'mt-5 text-[19px] leading-[1.7] text-charcoal',
            align === 'center' && 'mx-auto max-w-[720px]',
            align === 'left' && 'max-w-2xl',
          )}
        >
          {description}
        </p>
      </div>
    </section>
  );
}
