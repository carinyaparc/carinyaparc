/**
 * NavLink composition component
 * Navigation link with active state handling
 * Task: T2.3
 */

import * as React from 'react';
import { cn } from './utils';

export interface NavLinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
  href: string;
  label?: string;
  verb?: string;
  rest?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
}

const NavLink = React.forwardRef<HTMLAnchorElement, NavLinkProps>(
  ({ href, label, verb, rest, icon, isActive, className, children, ...props }, ref) => {
    return (
      <a
        ref={ref}
        href={href}
        className={cn(
          'flex items-center gap-2 transition-colors duration-300',
          'px-3 py-2 rounded-lg text-sm font-medium',
          'hover:bg-eucalyptus-100 hover:text-eucalyptus-600',
          isActive && 'text-eucalyptus-600 bg-eucalyptus-50',
          !isActive && 'text-charcoal-600',
          className,
        )}
        aria-current={isActive ? 'page' : undefined}
        {...props}
      >
        {icon && <span className="shrink-0">{icon}</span>}
        {label ? (
          <span>{label}</span>
        ) : verb || rest ? (
          <span className="flex flex-col items-start">
            {verb && <span className="font-bold text-eucalyptus-400">{verb}</span>}
            {rest && <span className="text-xs font-normal mt-0.5">{rest}</span>}
          </span>
        ) : (
          children
        )}
      </a>
    );
  },
);
NavLink.displayName = 'NavLink';

export { NavLink };
