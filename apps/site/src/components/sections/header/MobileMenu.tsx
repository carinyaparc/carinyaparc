/**
 * MobileMenu sub-component - Extracted from Header
 * Maps to: * Task: T4.1
 */

'use client';

import Link from 'next/link';
import { X } from 'lucide-react';
import { motion } from 'framer-motion';
import { NavItem } from '@/src/app/navigation';

interface MobileMenuProps {
  navigation: NavItem[];
  isOpen: boolean;
  onClose: () => void;
  onSubscribeClick: () => void;
}

export default function MobileMenu({
  navigation,
  isOpen,
  onClose,
  onSubscribeClick,
}: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-eucalypt-900/45 backdrop-blur-sm lg:hidden"
      onClick={onClose}
    >
      <motion.nav
        id="mobile-menu"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-xs bg-eucalypt-900 shadow-lg p-6 sm:max-w-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <Link href="/" className="hover:opacity-70 transition-opacity duration-150" onClick={onClose}>
            <span className="font-heading text-lg tracking-[0.3em] uppercase text-primary-foreground">
              Carinya&nbsp;Parc
            </span>
          </Link>
          <button
            className="-m-2.5 rounded-pill p-2.5 text-inverse hover:opacity-70"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mt-6 flow-root">
          <div className="-my-6 divide-y divide-eucalypt-800">
            <div className="space-y-1 py-6">
              {navigation
                .filter((item) => item.visible !== false)
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-3 text-base font-medium text-inverse hover:opacity-70 border-b border-eucalypt-800 last:border-0"
                    onClick={onClose}
                  >
                    {item.label ? (
                      <span>{item.label}</span>
                    ) : (
                      <span className="flex flex-col">
                        <span className="text-base font-semibold text-fleece">{item.verb}</span>
                        <span className="text-sm font-normal text-inverse-subtle">{item.rest}</span>
                      </span>
                    )}
                  </Link>
                ))}
            </div>
            <div className="py-6 space-y-3">
              <Link
                href="/regenerate"
                onClick={onClose}
                className="block w-full rounded-pill bg-wattle px-5 py-3.5 text-center text-sm font-semibold text-kangaroo-900 hover:bg-kangaroo-400 transition-colors"
              >
                Get involved
              </Link>
              <button
                onClick={() => {
                  onClose();
                  onSubscribeClick();
                }}
                className="block w-full rounded-pill border border-fleece/40 px-5 py-3 text-center text-sm font-semibold text-inverse hover:bg-fleece/10 transition-colors"
              >
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </motion.nav>
    </motion.div>
  );
}
