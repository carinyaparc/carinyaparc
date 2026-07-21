/**
 * ContactFormSection organism - Refactored with FormField molecule
 * Maps to: * Task: T4.3
 *
 *Preserved all existing validation and submission logic
 */

'use client';

import { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/SelectNative';
import { Alert } from '@/components/ui/Alert';
import { FormField } from '@/components/ui/FormField';
import {
  contactFormClientSchema,
  type ContactFormClientData,
  type ContactFormData,
  type InquiryType,
} from '@/src/lib/validation/contact-schema';
import { sanitizeContactFormData } from '@/src/lib/validation/sanitize';
import { FormQueryProvider } from '@/providers/FormQueryProvider';

const INQUIRY_OPTIONS: { value: InquiryType; label: string }[] = [
  { value: 'partnership', label: 'A grant or partnership' },
  { value: 'volunteer', label: 'Volunteering / planting days' },
  { value: 'tours', label: 'Booking a tour or visit' },
  { value: 'general', label: 'Media, press, or something else' },
];

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

export default function ContactFormSection(props: ContactFormSectionProps = {}) {
  return (
    <FormQueryProvider>
      <ContactFormSectionInner {...props} />
    </FormQueryProvider>
  );
}

function ContactFormSectionInner({ onSuccess, onError }: ContactFormSectionProps = {}) {
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
  const { mutate, reset: resetMutation, isPending, isSuccess, isError, error } = useMutation({
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

  // Success state — swap form for confirmation (Contact.dc.html)
  if (isSuccess) {
    return (
      <div className="px-2 py-8 text-center sm:px-4 sm:py-10">
        <div className="mx-auto flex h-[72px] w-[72px] items-center justify-center rounded-pill bg-eucalypt-50">
          <Image src="/motifs/motif-sprout.svg" alt="" width={38} height={38} aria-hidden />
        </div>
        <h2 className="mt-[22px] font-heading text-[28px] font-normal text-eucalypt-600">
          Message sent — thank you
        </h2>
        <p className="mx-auto mt-2.5 max-w-[400px] text-base leading-[1.6] text-charcoal">
          We read every message ourselves. Expect a reply within a few days — sooner if the
          kettle&apos;s on.
        </p>
        <Button
          type="button"
          className="mt-6"
          onClick={() => {
            resetMutation();
            reset();
            formLoadTime.current = Date.now();
          }}
        >
          Send another →
        </Button>
      </div>
    );
  }

  return (
    <div>
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
          <FormField name="firstName" label="First name" error={errors.firstName?.message} required>
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
          <FormField name="lastName" label="Last name" error={errors.lastName?.message} required>
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
            <FormField name="email" label="Email" error={errors.email?.message} required>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                {...register('email')}
                disabled={isPending || isSubmitting}
                placeholder="jane@example.com"
              />
            </FormField>
          </div>

          {/* Phone Number - optional */}
          <div className="sm:col-span-2">
            <FormField
              name="phone"
              label="Phone number"
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
              label="I'm reaching out about"
              error={errors.inquiryType?.message}
              required
            >
              <Select
                id="inquiryType"
                {...register('inquiryType')}
                disabled={isPending || isSubmitting}
              >
                <option value="">Select a topic</option>
                {INQUIRY_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
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
              error={errors.message?.message}
              required
            >
              <Textarea
                id="message"
                rows={5}
                {...register('message')}
                disabled={isPending || isSubmitting}
                placeholder="Tell us what you have in mind..."
                maxLength={500}
              />
            </FormField>
          </div>

          {/* Honeypot field - hidden from users */}
          <div className="sm:col-span-2" aria-hidden="true" style={{ display: 'none' }}>
            <label htmlFor="website" className="block text-sm/6 font-semibold text-charcoal">
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
          <div className="mt-6 sm:col-span-2">
            <Button
              type="submit"
              disabled={isPending || isSubmitting || !isFormReady}
              isLoading={isPending}
              className="w-full justify-center"
            >
              {isPending ? 'Sending message…' : 'Send message →'}
            </Button>

            <p className="mt-3.5 text-center text-[13px] text-stone">
              We respect your privacy. We&apos;ll only use your details to reply. Read our{' '}
              <Link
                href="/legal/privacy-policy"
                className="font-semibold text-eucalypt-600 hover:opacity-70"
              >
                privacy policy
              </Link>
              .
            </p>
          </div>
        </div>
      </form>
    </div>
  );
}
