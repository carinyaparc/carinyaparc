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
      className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm lg:hidden"
      onClick={onClose}
    >
      <motion.nav
        id="mobile-menu"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'tween', duration: 0.3 }}
        className="fixed right-0 top-0 bottom-0 w-full max-w-xs bg-charcoal-900 shadow-lg p-6 sm:max-w-sm sm:ring-1 sm:ring-white/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-2">
            <Link href="/" className="hover:opacity-80 transition-opacity duration-300">
              <span className="text-xl font-bold text-white">Carinya Parc</span>
            </Link>
          </div>
          <button
            className="-m-2.5 rounded-md p-2.5 text-gray-400"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X size={24} />
          </button>
        </div>

        <div className="mt-6 flow-root">
          <div className="-my-6 divide-y divide-charcoal-100/25">
            <div className="space-y-2 py-6">
              {navigation
                .filter((item) => item.visible !== false)
                .map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="-mx-3 block rounded-lg px-3 py-2 text-base font-semibold text-white hover:bg-gray-800"
                    onClick={onClose}
                  >
                    {item.label ? (
                      <span>{item.label}</span>
                    ) : (
                      <span className="flex flex-col">
                        <span className="text-base font-bold text-eucalyptus-400">{item.verb}</span>
                        <span className="text-sm font-normal">{item.rest}</span>
                      </span>
                    )}
                  </Link>
                ))}
            </div>
            <div className="py-6">
              <button
                onClick={() => {
                  onClose();
                  onSubscribeClick();
                }}
                className="-mx-3 block rounded-lg px-3 py-2.5 text-base font-semibold leading-7 text-white hover:bg-gray-800 w-full text-left"
              >
                Follow our Journey
              </button>
            </div>
          </div>
        </div>
      </motion.nav>
    </motion.div>
  );
}
