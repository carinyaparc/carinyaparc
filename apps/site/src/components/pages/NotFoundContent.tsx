import Image from 'next/image';
import Link from 'next/link';

const HERO_BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';

export function NotFoundContent() {
  return (
    <section className="relative isolate flex min-h-screen items-center bg-eucalypt-900">
      <Image
        src="/images/farm-track-gate.jpg"
        alt=""
        fill
        priority
        sizes="100vw"
        quality={85}
        placeholder="blur"
        blurDataURL={HERO_BLUR_DATA_URL}
        className="absolute inset-0 -z-20 object-cover object-center"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(18,38,26,0.86)_0%,rgba(18,38,26,0.66)_46%,rgba(18,38,26,0.40)_100%)]"
      />

      <div className="relative z-10 mx-auto w-full max-w-[1240px] px-6 pb-20 pt-[120px] lg:px-14">
        <div className="max-w-[640px]">
          <p
            aria-hidden="true"
            className="font-heading text-[120px] font-normal leading-[0.9] text-wattle sm:text-[170px]"
          >
            404
          </p>
          <p className="mt-2 text-[13px] font-semibold uppercase tracking-[0.24em] text-wattle">
            Took a wrong turn
          </p>
          <h1 className="mt-4 max-w-[560px] text-balance font-heading text-[38px] font-normal leading-[1.06] text-fleece sm:text-[52px]">
            This track doesn&apos;t lead anywhere
          </h1>
          <div className="mt-8 flex flex-wrap gap-3.5">
            <Link
              href="/"
              className="inline-flex items-center rounded-pill bg-bracken-500 px-7 py-3.5 text-[15px] font-semibold text-fleece transition-colors hover:bg-bracken-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bracken-500"
            >
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
