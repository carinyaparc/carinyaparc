/**
 * Header organism - Refactored with extracted MobileMenu
 * Maps to: * Task: T4.1
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { NavItem } from '@/src/app/navigation';
import SubscribeModal from '@/src/components/forms/SubscribeModal';
import MobileMenu from './MobileMenu';
import { cn } from '@/src/lib/cn';

interface HeaderProps {
  navigation: NavItem[];
}

export default function Header({ navigation }: HeaderProps) {
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [subscribeModalOpen, setSubscribeModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(!isHomePage);

  // Close mobile menu when route changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  // Detect scroll position to change header background
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isHomePage]);

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

  // Apply styles based on scroll position or page
  const headerClass =
    isScrolled || !isHomePage
      ? 'fixed top-4 left-0 right-0 bg-white text-charcoal-300 shadow-md'
      : 'absolute top-4 left-0 right-0 bg-transparent text-white';

  const hoverClass = 'hover:bg-eucalyptus-100 rounded-lg';

  return (
    <>
      <header className={cn('z-40 transition-all duration-300', headerClass)}>
        <nav
          aria-label="Main navigation"
          className="mx-auto flex max-w-7xl items-center justify-between p-4 lg:px-8"
        >
          <div className="flex lg:flex-1">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center space-x-2"
            >
              <Link href="/" className="hover:opacity-80 transition-opacity duration-300">
                <span className="text-2xl font-bold text-eucalyptus-600 transition-colors duration-300">
                  Carinya Parc
                </span>
              </Link>
            </motion.div>
          </div>

          {/* Mobile menu button */}
          <div className="flex lg:hidden">
            <button
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white transition-colors duration-300"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop navigation */}
          <div className="hidden lg:flex flex-1 justify-evenly max-w-3xl mx-auto">
            {navigation
              .filter((item) => item.visible !== false)
              .map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'transition-colors duration-300 flex flex-col items-start text-left px-2 py-1',
                    hoverClass,
                    { 'text-eucalyptus-100': pathname === item.href },
                  )}
                >
                  {item.label ? (
                    <span>{item.label}</span>
                  ) : (
                    <span className="flex flex-col items-start">
                      <span className="text-base font-bold text-eucalyptus-400">{item.verb}</span>
                      <span className="text-xs font-normal mt-1 whitespace-nowrap">
                        {item.rest}
                      </span>
                    </span>
                  )}
                </Link>
              ))}
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end">
            <button
              onClick={() => setSubscribeModalOpen(true)}
              className={`rounded-md bg-eucalyptus-600 text-white hover:bg-eucalyptus-200 hover:text-eucalyptus-600 px-3 py-2 text-sm font-semibold shadow-xs focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-eucalyptus-600 transition-colors duration-300`}
            >
              Follow our Journey
            </button>
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
