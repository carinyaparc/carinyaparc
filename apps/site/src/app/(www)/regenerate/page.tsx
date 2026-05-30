import { HeaderWithStats } from '@/src/components/sections/page-header';
import { SchemaMarkup } from '@/src/components/ui/SchemaMarkup';
import { Breadcrumb } from '@/src/components/ui/Breadcrumb';

export default function RegeneratePage() {
  const links = [
    { name: 'Volunteer Opportunities', href: '/regenerate#volunteer' },
    { name: 'Support Projects', href: '/regenerate#support' },
    { name: 'Learn and Share', href: '/regenerate#learn' },
    { name: 'Regeneration FAQ', href: '/regeneration/faq' },
  ];

  const stats = [
    { name: 'Hectares Being Restored', value: '42' },
    { name: 'Native Trees Planned', value: '30,000+' },
    { name: 'River Frontage (meters)', value: '400' },
    { name: 'Ecological Zones', value: '5' },
  ];

  return (
    <>
      {/* Schema markup for regenerate page */}
      <SchemaMarkup type="page" />

      <main className="min-h-screen">
        {/* Breadcrumb navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          <Breadcrumb />
        </div>

        <HeaderWithStats
          subtitle="Regenerate with Us"
          title="Healing Land Through Ecological Restoration"
          description="Join us as we transform 42 hectares of former grazing land into thriving, biodiverse ecosystems through strategic restoration, wildlife corridors, and regenerative agroforestry."
          backgroundImage="/images/river-valley-aerial.jpg"
          backgroundImageAlt="Carinya Parc landscape being regenerated"
          links={links}
          stats={stats}
        />

        {/* Additional page content will be added in future tasks */}
      </main>
    </>
  );
}
