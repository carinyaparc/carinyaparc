import Image from 'next/image';
import { SchemaMarkup } from '@/src/components/ui/SchemaMarkup';
import { Breadcrumb } from '@/src/components/ui/Breadcrumb';

export default function JonathanPage() {
  return (
    <>
      {/* Schema markup for about page */}
      <SchemaMarkup type="about" />

      <main className="isolate min-h-screen">
        {/* Breadcrumb navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Breadcrumb />
        </div>

        {/* Page Header */}
        <div className="mt-32 overflow-hidden sm:mt-40">
          <div className="mx-auto max-w-7xl px-6 lg:flex lg:px-8">
            <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-12 gap-y-16 lg:mx-0 lg:max-w-none lg:min-w-full lg:flex-none lg:gap-y-8">
              <div className="lg:col-end-1 lg:w-full lg:max-w-lg lg:pb-8">
                <p className="text-eucalyptus-300 text-base/7 font-semibold mb-2">
                  About Jonathan Daddia
                </p>
                <h1 className="max-w-2xl text-5xl font-semibold tracking-tight text-balance text-eucalyptus-600 sm:text-7xl lg:col-span-2 xl:col-auto">
                  Meet Jonno
                </h1>
                <p className="mt-6 text-xl/8 text-charcoal-600">
                  Founder and Steward of Carinya Parc and Transformation Lead at Temple & Webster,
                  Australia's leading e-commerce retailer. With over two decades of experience in
                  top-tier strategy consulting and industry leadership, Jonathan has driven
                  large-scale digital transformation and strategic growth across financial services,
                  retail, e-commerce and beyond.
                </p>
                <p className="mt-6 text-xl/8 text-gray-600">
                  For twenty years, Jonathan dreamed of swapping boardrooms for back paddocks. In
                  early 2024, he acted on that vision—applying corporate-grade rigor to ecological
                  restoration.
                </p>
                <p className="mt-6 text-base/7 text-gray-600">
                  Fourteen years ago, Jonathan surprised the world—and himself—by earning a place as
                  a MasterChef finalist. That experience ignited his passion for hands-on problem
                  solving and lifelong learning. Since then, he's continued to balance his strategic
                  consulting career with culinary pursuits, even honing his skills during weekends
                  at Gordon Ramsay's Petrus in London while maintaining a full-time corporate role.
                </p>
              </div>
              <div className="flex flex-wrap items-start justify-end gap-6 sm:gap-8 lg:contents">
                <div className="w-0 flex-auto lg:ml-auto lg:w-auto lg:flex-none lg:self-end">
                  <Image
                    alt="Jonathan working on the farm"
                    src="/images/river-valley-aerial.jpg"
                    width={592}
                    height={423}
                    className="aspect-[7/5] w-[37rem] max-w-none rounded-2xl bg-gray-50 object-cover"
                  />
                </div>
                <div className="contents lg:col-span-2 lg:col-end-2 lg:ml-auto lg:flex lg:w-[37rem] lg:items-start lg:justify-end lg:gap-x-8">
                  <div className="order-first flex w-64 flex-none justify-end self-end lg:w-auto">
                    <Image
                      alt="Farm landscape"
                      src="/images/alpacas-hill-pasture.jpg"
                      width={384}
                      height={288}
                      className="aspect-[4/3] w-[24rem] max-w-none flex-none rounded-2xl bg-gray-50 object-cover"
                    />
                  </div>
                  <div className="flex w-96 flex-auto justify-end lg:w-auto lg:flex-none">
                    <Image
                      alt="Jonathan in strategic planning"
                      src="/images/property-river-aerial.jpg"
                      width={592}
                      height={423}
                      className="aspect-[7/5] w-[37rem] max-w-none flex-none rounded-2xl bg-gray-50 object-cover"
                    />
                  </div>
                  <div className="hidden sm:block sm:w-0 sm:flex-auto lg:w-auto lg:flex-none">
                    <Image
                      alt="Jonathan planting trees"
                      src="/images/highland-cattle-paddock.jpg"
                      width={384}
                      height={288}
                      className="aspect-[4/3] w-[24rem] max-w-none rounded-2xl bg-gray-50 object-cover"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
