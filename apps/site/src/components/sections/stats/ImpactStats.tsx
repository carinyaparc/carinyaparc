import { cn } from '@/lib/cn';

export type ImpactStat = {
  value: string;
  label: string;
};

const DEFAULT_STATS: ImpactStat[] = [
  { value: '42', label: 'hectares under restoration' },
  { value: '30k+', label: 'native trees to plant' },
  { value: '104', label: 'acres of habitat corridor' },
  { value: '1', label: 'river frontage restored' },
];

interface ImpactStatsProps {
  eyebrow?: string;
  stats?: ImpactStat[];
  className?: string;
}

export function ImpactStats({
  eyebrow = 'Progress in the ground',
  stats = DEFAULT_STATS,
  className,
}: ImpactStatsProps) {
  return (
    <section className={cn('bg-eucalypt-800 py-[74px] text-inverse', className)}>
      <div className="mx-auto max-w-[1240px] px-6 lg:px-14">
        <p className="text-center text-[13px] font-semibold uppercase tracking-[0.24em] text-wattle">
          {eyebrow}
        </p>
        <div className="mt-10 grid grid-cols-2 gap-10 lg:grid-cols-4">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-heading text-5xl leading-none text-primary-foreground lg:text-[56px]">
                {stat.value}
              </div>
              <div className="mt-2.5 text-[15px] text-inverse-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
