/**
 * SocialLinks sub-component - Extracted from Footer
 * Maps to: * Task: T4.2
 */

import * as React from 'react';

interface SocialLink {
  name: string;
  href: string;
  icon: (props: React.SVGProps<SVGSVGElement>) => React.JSX.Element;
}

interface SocialLinksProps {
  links: SocialLink[];
}

export default function SocialLinks({ links }: SocialLinksProps) {
  return (
    <div className="mt-4 flex justify-center md:mt-0 md:justify-end">
      {links.map((item) => (
        <a
          key={item.name}
          href={item.href}
          className="text-footer-subtle hover:text-wattle mx-2 transition-colors"
          aria-label={`${item.name} social link`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="sr-only">{item.name}</span>
          <item.icon aria-hidden="true" className="h-6 w-6" />
        </a>
      ))}
    </div>
  );
}
