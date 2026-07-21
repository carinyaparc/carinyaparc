/**
 * FooterNav sub-component - Extracted from Footer
 * Maps to: * Task: T4.2
 */

import Link from 'next/link';

interface NavigationItem {
  name: string;
  href: string;
}

interface FooterNavProps {
  sections: {
    title: string;
    items: NavigationItem[];
  }[];
}

export default function FooterNav({ sections }: FooterNavProps) {
  return (
    <div className="mt-12 grid grid-cols-2 gap-8 xl:col-span-2 xl:mt-0">
      {sections.map((section, idx) => (
        <div key={section.title} className={idx % 2 === 0 ? 'md:grid md:grid-cols-2 md:gap-8' : ''}>
          <div className={idx % 2 === 0 && idx < sections.length - 1 ? '' : 'mt-10 md:mt-0'}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-wattle">
              {section.title}
            </h3>
            <ul role="list" className="mt-4 space-y-3">
              {section.items.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-[#C7D3BF] hover:opacity-70 transition-opacity"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
}
