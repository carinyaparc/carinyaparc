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
    <div className="mt-12 flex flex-col gap-8 sm:flex-row sm:gap-16 xl:mt-0">
      {sections.map((section) => (
        <div key={section.title}>
          <h3 className="text-xs font-semibold uppercase tracking-[0.24em] text-wattle">
            {section.title}
          </h3>
          <ul role="list" className="mt-4 space-y-3">
            {section.items.map((item) => (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className="text-sm text-footer-foreground hover:opacity-70 transition-opacity"
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
