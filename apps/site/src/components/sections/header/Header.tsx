/**
 * Header organism - Refactored with extracted MobileMenu
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import { NavItem } from '@/src/app/navigation';
import SubscribeModal from '@/src/components/forms/SubscribeModal';
import MobileMenu from './MobileMenu';
import { cn } from '@/src/lib/cn';

interface HeaderProps {
  navigation: NavItem[];
  /** Transparent header over a full-bleed photo (home, 404). */
  overlay?: boolean;
}

export default function Header({ navigation, overlay = false }: HeaderProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';
  const isOverlayPage = overlay || isHomePage;

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(!isOverlayPage);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Detect scroll position to change header background
  useEffect(() => {
    if (overlay) {
      setIsScrolled(false);
      return;
    }

    if (!isHomePage) {
      setIsScrolled(true);
      return;
    }

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [overlay, isHomePage]);

  // Prevent scrolling when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [mobileMenuOpen]);

  const isSolid = overlay ? false : isScrolled || !isHomePage;

  const headerClass = isSolid
    ? 'sticky top-0 bg-fleece text-charcoal border-b border-line'
    : 'absolute top-0 left-0 right-0 bg-transparent text-fleece';

  return (
    <>
      <header className={cn('z-40 transition-all duration-300', headerClass)}>
        <nav
          aria-label="Main navigation"
          className="mx-auto flex max-w-[1240px] items-center justify-between gap-5 px-6 py-[22px] lg:px-14"
        >
          <div className="flex flex-1">
            <Link href="/" className="hover:opacity-70 transition-opacity duration-150">
              <span
                className={cn(
                  'font-heading text-xl tracking-[0.3em] uppercase',
                  isSolid ? 'text-eucalypt-600' : 'text-fleece',
                )}
              >
                Carinya&nbsp;Parc
              </span>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              className={cn(
                '-m-2.5 inline-flex items-center justify-center rounded-pill border px-3 py-2.5 transition-colors duration-150',
                isSolid
                  ? 'border-line text-bark bg-fleece'
                  : 'border-fleece/50 text-fleece bg-fleece/14',
              )}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop navigation */}
          <div
            className={cn(
              'hidden lg:flex flex-1 justify-end items-center gap-8 text-[15px] font-medium',
              isSolid ? 'text-charcoal' : 'text-fleece',
            )}
          >
            {navigation
              .filter((item) => item.visible !== false)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'transition-opacity duration-150 hover:opacity-70',
                    pathname === item.href && 'opacity-70',
                  )}
                >
                  {item.label ? (
                    <span>{item.label}</span>
                  ) : (
                    <span className="flex flex-col items-start leading-tight">
                      <span
                        className={cn(
                          'text-[15px] font-medium',
                          isSolid ? 'text-eucalypt-600' : 'text-fleece',
                        )}
                      >
                        {item.verb}
                      </span>
                      <span className="text-xs font-normal mt-0.5 whitespace-nowrap opacity-80">
                        {item.rest}
                      </span>
                    </span>
                  )}
                </Link>
              ))}
            <Link
              href="/regenerate"
              className={cn(
                'rounded-pill px-[22px] py-[11px] text-sm font-semibold transition-colors duration-150',
                isSolid
                  ? 'bg-eucalypt-600 text-primary-foreground hover:bg-eucalypt-700'
                  : 'bg-wattle text-kangaroo-900 hover:bg-kangaroo-400',
              )}
            >
              Get involved
            </Link>
          </div>
        </nav>

        {/* Mobile menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <MobileMenu
              navigation={navigation}
              isOpen={mobileMenuOpen}
              onClose={() => setMobileMenuOpen(false)}
              onSubscribeClick={() => setSubscribeModalOpen(true)}
            />
          )}
        </AnimatePresence>
      </header>

      <SubscribeModal open={subscribeModalOpen} onOpenChange={setSubscribeModalOpen} />
    </>
  );
}
