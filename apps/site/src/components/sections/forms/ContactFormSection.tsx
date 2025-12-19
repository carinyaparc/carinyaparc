/**
 * ContactFormSection organism - Refactored with FormField molecule
 * Maps to: * Task: T4.3
 *
 * Uses FormField molecule from @repo/ui
 * Preserved all existing validation and submission logic
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@repo/ui/button';
import { Input } from '@repo/ui/input';
import { Textarea } from '@repo/ui/textarea';
import { Select } from '@repo/ui/select-native';
import { Alert } from '@repo/ui/alert';
import { FormField } from '@repo/ui/form-field';
import {
  contactFormClientSchema,
  type ContactFormClientData,
  type ContactFormData,
  inquiryTypes,
  type InquiryType,
} from '@/src/lib/validation/contact-schema';
import { sanitizeContactFormData } from '@/src/lib/validation/sanitize';

// Vercel Analytics tracking (if available)
const trackEvent = (eventName: string, properties?: Record<string, unknown>) => {
  if (typeof window !== 'undefined' && 'va' in window) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (window as any).va('track', eventName, properties);
  }
};

/**
 * Submit contact form data to API endpoint
 */
async function submitContact(
  data: ContactFormData,
): Promise<{ success: boolean; message: string }> {
  const response = await fetch('/api/contact', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || 'Failed to submit form');
  }

  return result;
}

interface ContactFormSectionProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export default function ContactFormSection({ onSuccess, onError }: ContactFormSectionProps = {}) {
  // Track form load time for anti-bot measures
  const formLoadTime = useRef<number>(0);
  const [isFormReady, setIsFormReady] = useState(false);

  // Initialize form load time on mount
  useEffect(() => {
    formLoadTime.current = Date.now();
  }, []);

  // React Hook Form setup with Zod validation
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormClientData>({
    resolver: zodResolver(contactFormClientSchema),
    mode: 'onBlur',
  });

  // TanStack Query mutation for form submission
  const { mutate, isPending, isSuccess, isError, error } = useMutation({
    mutationFn: submitContact,
    onSuccess: () => {
      trackEvent('contact_form_success');
      reset();
      formLoadTime.current = Date.now();
      onSuccess?.();
    },
    onError: (err) => {
      trackEvent('contact_form_error', { error: err.message });
      onError?.(err as Error);
    },
  });

  // Track form view on mount
  useEffect(() => {
    setIsFormReady(true);
    trackEvent('contact_form_viewed');
  }, []);

  // Track when user starts filling form
  const handleFormInteraction = () => {
    trackEvent('contact_form_started');
  };

  /**
   * Handle form submission with anti-bot measures
   */
  const onSubmit = (data: ContactFormClientData) => {
    trackEvent('contact_form_submitted', { inquiry_type: data.inquiryType });

    // eslint-disable-next-line react-hooks/purity -- Date.now() in event handler is safe
    const submissionTime = formLoadTime.current > 0 ? Date.now() - formLoadTime.current : 0;
    const sanitizedData = sanitizeContactFormData(data);

    const fullData: ContactFormData = {
      ...sanitizedData,
      inquiryType: sanitizedData.inquiryType as InquiryType,
      website: '',
      submissionTime,
    };

    mutate(fullData);
  };

  // Success state UI
  if (isSuccess) {
    return (
      <Alert variant="success" className="mt-4">
        <CheckCircle className="h-5 w-5 text-eucalyptus-500 mr-2 mt-0.5 shrink-0" />
        <div>
          <p className="text-sm font-semibold">Thank you for your inquiry!</p>
          <p className="text-sm mt-1">
            We've received your message and will respond within 48 business hours.
          </p>
          <button
            onClick={() => {
              reset();
              formLoadTime.current = Date.now();
            }}
            className="mt-3 text-sm font-semibold text-eucalyptus-600 hover:text-eucalyptus-500 underline"
          >
            Send Another Message
          </button>
        </div>
      </Alert>
    );
  }

  return (
    <div className="mx-auto max-w-xl lg:max-w-lg">
      {/* Error state UI */}
      {isError && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5 shrink-0" />
          <div>
            <p className="text-sm font-semibold">Unable to send message</p>
            <p className="text-sm mt-1">
              {error?.message ||
                'Please try again or contact us directly at contact@carinyaparc.com.au'}
            </p>
          </div>
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="grid grid-cols-1 gap-x-8 gap-y-6 sm:grid-cols-2">
          {/* First Name */}
          <FormField name="firstName" label="First Name" error={errors.firstName?.message} required>
            <Input
              id="firstName"
              type="text"
              autoComplete="given-name"
              {...register('firstName')}
              onFocus={handleFormInteraction}
              disabled={isPending || isSubmitting}
            />
          </FormField>

          {/* Last Name */}
          <FormField name="lastName" label="Last Name" error={errors.lastName?.message} required>
            <Input
              id="lastName"
              type="text"
              autoComplete="family-name"
              {...register('lastName')}
              disabled={isPending || isSubmitting}
            />
          </FormField>

          {/* Email Address */}
          <div className="sm:col-span-2">
            <FormField name="email" label="Email Address" error={errors.email?.message} required>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                disabled={isPending || isSubmitting}
                placeholder="you@example.com"
              />
            </FormField>
          </div>

          {/* Phone Number - optional */}
          <div className="sm:col-span-2">
            <FormField
              name="phone"
              label="Phone Number"
              description="Optional"
              error={errors.phone?.message}
            >
              <Input
                id="phone"
                type="tel"
                autoComplete="tel"
                placeholder="+61 4XX XXX XXX"
                {...register('phone')}
                disabled={isPending || isSubmitting}
              />
            </FormField>
          </div>

          {/* Type of Inquiry */}
          <div className="sm:col-span-2">
            <FormField
              name="inquiryType"
              label="Type of Inquiry"
              error={errors.inquiryType?.message}
              required
            >
              <Select
                id="inquiryType"
                {...register('inquiryType')}
                disabled={isPending || isSubmitting}
              >
                <option value="">Select your inquiry type</option>
                {inquiryTypes.map((type) => (
                  <option key={type} value={type}>
                    {type === 'tours' ? 'Farm Tours' : type.charAt(0).toUpperCase() + type.slice(1)}
                  </option>
                ))}
              </Select>
            </FormField>
          </div>

          {/* Message */}
          <div className="sm:col-span-2">
            <FormField
              name="message"
              label="Message"
              description="Please provide details about your inquiry (50-500 characters)"
              error={errors.message?.message}
              required
            >
              <Textarea
                id="message"
                rows={5}
                {...register('message')}
                disabled={isPending || isSubmitting}
                placeholder="Tell us about your inquiry..."
                maxLength={500}
              />
            </FormField>
          </div>

          {/* Honeypot field - hidden from users */}
          <div className="sm:col-span-2" aria-hidden="true" style={{ display: 'none' }}>
            <label htmlFor="website" className="block text-sm/6 font-semibold text-charcoal-600">
              Website
            </label>
            <div className="mt-2.5">
              <input
                type="text"
                id="website"
                name="website"
                tabIndex={-1}
                autoComplete="off"
                className="block w-full rounded-md bg-white px-3.5 py-2"
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="mt-8 sm:col-span-2">
            <Button
              type="submit"
              disabled={isPending || isSubmitting || !isFormReady}
              isLoading={isPending}
              className="w-full"
            >
              {isPending ? 'Sending Message...' : 'Send Message'}
            </Button>

            <p className="mt-4 text-sm/6 text-charcoal-400 text-center">
              By submitting this form, you agree to our{' '}
              <Link
                href="/legal/privacy-policy"
                className="font-semibold text-eucalyptus-600 hover:text-eucalyptus-500"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
