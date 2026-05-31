/**
 * SubscribeSection organism - Consolidated from SubscribeForm and SubscribeModal
 * Maps to: * Task: T4.4
 *
 * Consolidated subscribe form and modal into single component
 */

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select-native';
import { FormField } from '@/components/ui/form-field';
import { Alert } from '@/components/ui/alert';

export interface SubscribeFormData {
  email: string;
  name: string;
  interests: string;
  website?: string; // honeypot field
  submissionTime?: number;
}

interface SubscribeSectionProps {
  showName?: boolean;
  showInterests?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function SubscribeSection({
  showName = true,
  showInterests = true,
  onSuccess,
  onError,
}: SubscribeSectionProps) {
  const [formData, setFormData] = useState<SubscribeFormData>({
    email: '',
    name: '',
    interests: '',
    website: '',
  });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [formLoadTime] = useState<number>(() => Date.now());

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    // Check for honeypot field
    if (formData.website) {
      setTimeout(() => {
        setStatus('success');
        setFormData({ email: '', name: '', interests: '', website: '' });
      }, 1000);
      return;
    }

    const submissionData = {
      ...formData,
      submissionTime: Date.now() - formLoadTime,
    };

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('success');
        setFormData({ email: '', name: '', interests: '', website: '' });
        onSuccess?.();
      } else {
        console.error('Subscription failed:', data.error);
        setStatus('error');
        setErrorMessage(data.error || 'Failed to subscribe. Please try again later.');
        onError?.(new Error(data.error || 'Subscription failed'));
      }
    } catch (err) {
      console.error('Error:', err);
      setStatus('error');
      setErrorMessage('Network error. Please check your connection and try again.');
      onError?.(err as Error);
    }
  };

  return (
    <div className="px-6 py-8">
      <div className="mx-auto max-w-xl lg:max-w-lg">
        {/* Success State */}
        {status === 'success' && (
          <Alert variant="success" className="mb-6">
            <CheckCircle className="h-5 w-5 text-eucalyptus-500 mr-2 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Thank you for subscribing!</p>
              <p className="text-sm mt-1">
                We've sent a confirmation email to your inbox. Please check your email to complete
                your subscription.
              </p>
            </div>
          </Alert>
        )}

        {/* Error State */}
        {status === 'error' && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold">Unable to subscribe</p>
              <p className="text-sm mt-1">{errorMessage}</p>
            </div>
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
            {/* Honeypot field - hidden from humans */}
            <div className="sm:col-span-2" aria-hidden="true" style={{ display: 'none' }}>
              <label htmlFor="website" className="block text-sm/6 font-semibold text-charcoal-600">
                Website
              </label>
              <div className="mt-2.5">
                <input
                  type="text"
                  name="website"
                  id="website"
                  value={formData.website}
                  onChange={handleInputChange}
                  tabIndex={-1}
                  autoComplete="off"
                  className="block w-full rounded-md bg-white px-3.5 py-2"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="sm:col-span-2">
              <FormField name="email" label="Email Address" required>
                <Input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  disabled={status === 'loading' || status === 'success'}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
              </FormField>
            </div>

            {/* Name */}
            {showName && (
              <div className="sm:col-span-2">
                <FormField name="name" label="Your Name">
                  <Input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    disabled={status === 'loading' || status === 'success'}
                    placeholder="Your name"
                    autoComplete="name"
                  />
                </FormField>
              </div>
            )}

            {/* Interests */}
            {showInterests && (
              <div className="sm:col-span-2">
                <FormField name="interests" label="What interests you most about Carinya Parc?">
                  <Select
                    name="interests"
                    id="interests"
                    value={formData.interests}
                    onChange={handleInputChange}
                    disabled={status === 'loading' || status === 'success'}
                  >
                    <option value="">Select your main interest</option>
                    <option value="regeneration">Ecological restoration</option>
                    <option value="farming">Regenerative farming</option>
                    <option value="community">Community involvement</option>
                    <option value="produce">Future produce</option>
                    <option value="learning">Learning opportunities</option>
                  </Select>
                </FormField>
              </div>
            )}
          </div>

          <div className="mt-8 flex flex-col">
            <Button
              type="submit"
              disabled={status === 'loading' || status === 'success'}
              isLoading={status === 'loading'}
              className="w-full"
            >
              {status === 'success' ? 'Subscribed!' : 'Subscribe to Our Newsletter'}
            </Button>

            <p className="mt-4 text-sm/6 text-gray-500 text-center">
              We promise to respect your privacy and your inbox. Read our{' '}
              <Link
                href="/legal/privacy-policy"
                className="font-semibold text-eucalyptus-600 hover:text-eucalyptus-500"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
