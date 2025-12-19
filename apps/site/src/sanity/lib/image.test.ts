/**
 * Unit Tests - Sanity Image URL Builder Utility
 *
 * Tests coverage:
 * - Valid image reference URL generation
 * - Transformation chaining
 * - Null/undefined handling
 * - TypeScript type exports
 * - Next.js Image integration
 * - Focal point support
 *
 * @module sanity/lib/image.test
 */

import { describe, expect, it, vi } from 'vitest';

import type { SanityImageObject } from './image';
import { getNextImageProps, urlFor } from './image';

// Mock Sanity client to avoid requiring real environment variables in tests
vi.mock('./client', () => ({
  client: {
    config: () => ({
      projectId: 'test-project-id',
      dataset: 'test-dataset',
    }),
  },
}));

describe('urlFor()', () => {
  describe('valid image references', () => {
    it('should generate URL for image object with asset reference ', () => {
      const imageRef: SanityImageObject = {
        _type: 'image',
        asset: {
          _ref: 'image-Tb9Ew8CXIwaY6R1kjMvI0uRR-1920x1080-jpg',
          _type: 'reference',
        },
      };

      const url = urlFor(imageRef).url();

      expect(url).toBeTruthy();
      expect(url).toContain('cdn.sanity.io');
      expect(url).toContain('test-project-id');
      expect(url).toContain('test-dataset');
      expect(url).toContain('Tb9Ew8CXIwaY6R1kjMvI0uRR');
    });

    it('should generate URL for string asset reference', () => {
      const assetId = 'image-Xyz789AbcDefGhiJklMnoPqr-800x600-png';

      const url = urlFor(assetId).url();

      expect(url).toBeTruthy();
      expect(url).toContain('cdn.sanity.io');
      expect(url).toContain('Xyz789AbcDefGhiJklMnoPqr');
    });

    it('should support transformation chaining ', () => {
      const imageRef: SanityImageObject = {
        _type: 'image',
        asset: {
          _ref: 'image-TestAbcDefGhiJklMnoPqrStu-1920x1080-jpg',
          _type: 'reference',
        },
      };

      const url = urlFor(imageRef).width(800).height(600).quality(90).format('webp').url();

      expect(url).toContain('w=800');
      expect(url).toContain('h=600');
      expect(url).toContain('q=90');
      expect(url).toContain('fm=webp');
    });

    it('should support fit and crop transformations', () => {
      const imageRef: SanityImageObject = {
        _type: 'image',
        asset: {
          _ref: 'image-FitCropAbcDefGhiJklMnoPqr-1920x1080-jpg',
          _type: 'reference',
        },
      };

      const url = urlFor(imageRef).width(400).height(400).fit('crop').crop('center').url();

      expect(url).toContain('w=400');
      expect(url).toContain('h=400');
      expect(url).toContain('fit=crop');
      expect(url).toContain('crop=center');
    });

    it('should respect focal point from hotspot data', () => {
      const imageWithHotspot: SanityImageObject = {
        _type: 'image',
        asset: {
          _ref: 'image-HotspotAbcDefGhiJklMnoPqr-1920x1080-jpg',
          _type: 'reference',
        },
        hotspot: {
          _type: 'sanity.imageHotspot',
          x: 0.5,
          y: 0.3,
          width: 0.5,
          height: 0.3,
        },
      };

      const url = urlFor(imageWithHotspot).width(800).crop('focalpoint').url();

      expect(url).toContain('crop=focalpoint');
      // Sanity's image-url library automatically applies hotspot data
      expect(url).toBeTruthy();
    });

    it('should support crop data from Sanity', () => {
      const imageWithCrop: SanityImageObject = {
        _type: 'image',
        asset: {
          _ref: 'image-CropDataAbcDefGhiJklMnoPqr-1920x1080-jpg',
          _type: 'reference',
        },
        crop: {
          _type: 'sanity.imageCrop',
          top: 0.1,
          bottom: 0.1,
          left: 0,
          right: 0,
        },
      };

      const url = urlFor(imageWithCrop).width(800).url();

      // Sanity's image-url library automatically applies crop data
      expect(url).toBeTruthy();
      expect(url).toContain('cdn.sanity.io');
    });

    it('should maintain immutability and allow method chaining', () => {
      const imageRef: SanityImageObject = {
        _type: 'image',
        asset: {
          _ref: 'image-ImmutableAbcDefGhiJklMnoPqr-1920x1080-jpg',
          _type: 'reference',
        },
      };

      const baseBuilder = urlFor(imageRef);
      const url1 = baseBuilder.width(800).url();
      const url2 = baseBuilder.width(1200).url();

      // Different transformations should produce different URLs
      expect(url1).toContain('w=800');
      expect(url2).toContain('w=1200');
      // Both URLs should be valid
      expect(url1).toBeTruthy();
      expect(url2).toBeTruthy();
    });
  });

  describe('null/undefined handling', () => {
    it('should handle null image gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const url = urlFor(null).url();

      expect(url).toBe('');
      expect(() => urlFor(null)).not.toThrow();

      // Should log warning in development
      if (process.env.NODE_ENV === 'development') {
        expect(consoleSpy).toHaveBeenCalled();
      }

      consoleSpy.mockRestore();
    });

    it('should handle undefined image gracefully', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const url = urlFor(undefined).url();

      expect(url).toBe('');
      expect(() => urlFor(undefined)).not.toThrow();

      consoleSpy.mockRestore();
    });

    it('should not throw when chaining transformations on null source', () => {
      expect(() => {
        urlFor(null).width(800).height(600).quality(90).url();
      }).not.toThrow();
    });
  });

  describe('TypeScript types', () => {
    it('should export ImageUrlBuilder type', () => {
      const imageRef: SanityImageObject = {
        _type: 'image',
        asset: {
          _ref: 'image-TypeTestAbcDefGhiJklMnoPqr-1920x1080-jpg',
          _type: 'reference',
        },
      };

      const builder = urlFor(imageRef);

      // TypeScript should infer these methods
      expect(builder).toHaveProperty('url');
      expect(builder).toHaveProperty('width');
      expect(builder).toHaveProperty('height');
      expect(builder).toHaveProperty('quality');
      expect(builder).toHaveProperty('format');
      expect(builder).toHaveProperty('fit');
      expect(builder).toHaveProperty('crop');
    });

    it('should accept various SanityImageSource formats', () => {
      // Image object
      const imageObject: SanityImageObject = {
        _type: 'image',
        asset: { _ref: 'image-FormatAbcDefGhiJklMnoPqr-800x600-jpg', _type: 'reference' },
      };

      // String reference
      const stringRef = 'image-StringAbcDefGhiJklMnoPqr-800x600-jpg';

      // Reference object
      const refObject = {
        _ref: 'image-RefObjAbcDefGhiJklMnoPqr-800x600-jpg',
        _type: 'reference' as const,
      };

      // All should work without TypeScript errors
      expect(urlFor(imageObject).url()).toBeTruthy();
      expect(urlFor(stringRef).url()).toBeTruthy();
      expect(urlFor(refObject).url()).toBeTruthy();
    });
  });

  describe('integration with Next.js Image', () => {
    it('should generate URLs compatible with next/image src prop', () => {
      const imageRef: SanityImageObject = {
        _type: 'image',
        asset: {
          _ref: 'image-NextJsAbcDefGhiJklMnoPqrStu-1920x1080-jpg',
          _type: 'reference',
        },
      };

      const url = urlFor(imageRef).width(800).url();

      // Next.js Image requires absolute URLs starting with https://
      expect(url).toMatch(/^https:\/\//);
      expect(url).not.toContain('undefined');
      expect(url).not.toContain('null');
    });

    it('should work with getNextImageProps helper', () => {
      const imageRef: SanityImageObject = {
        _type: 'image',
        asset: {
          _ref: 'image-HelperAbcDefGhiJklMnoPqrStu-1920x1080-jpg',
          _type: 'reference',
        },
        alt: 'Test image',
      };

      const props = getNextImageProps(imageRef, {
        width: 800,
        height: 600,
        quality: 85,
      });

      expect(props.src).toMatch(/^https:\/\//);
      expect(props.width).toBe(800);
      expect(props.height).toBe(600);
      expect(props.alt).toBe('Test image');
      expect(props.src).toContain('w=800');
      expect(props.src).toContain('q=85');
    });

    it('should handle null image in getNextImageProps', () => {
      const props = getNextImageProps(null, { width: 800 });

      expect(props.src).toBe('');
      expect(props.width).toBe(800);
      expect(props.alt).toBe('');
      expect(() => getNextImageProps(null)).not.toThrow();
    });

    it('should use metadata dimensions when available', () => {
      const imageWithMetadata: SanityImageObject = {
        _type: 'image',
        asset: {
          _id: 'image-MetadataAbcDefGhiJklMnoPqr-1920x1080-jpg',
          _type: 'sanity.imageAsset',
          url: 'https://cdn.sanity.io/images/test-project-id/test-dataset/MetadataAbcDefGhiJklMnoPqr-1920x1080.jpg',
          metadata: {
            dimensions: {
              width: 1920,
              height: 1080,
              aspectRatio: 1.778,
            },
            lqip: 'data:image/jpeg;base64,/9j/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYa...',
          },
        },
      };

      const props = getNextImageProps(imageWithMetadata);

      expect(props.width).toBe(1920);
      expect(props.height).toBe(1080);
      expect(props.blurDataURL).toBeTruthy();
    });
  });

  describe('performance', () => {
    it('should generate URLs in < 1ms p95', () => {
      const imageRef: SanityImageObject = {
        _type: 'image',
        asset: {
          _ref: 'image-PerfTestAbcDefGhiJklMnoPqr-1920x1080-jpg',
          _type: 'reference',
        },
      };

      const iterations = 100;
      const timings: number[] = [];

      for (let i = 0; i < iterations; i++) {
        const start = performance.now();
        urlFor(imageRef).width(800).height(600).quality(90).url();
        const end = performance.now();
        timings.push(end - start);
      }

      // Calculate p95
      timings.sort((a, b) => a - b);
      const p95Index = Math.floor(timings.length * 0.95);
      const p95 = timings[p95Index];

      expect(p95).toBeLessThan(1); // < 1ms target
    });

    it('should not throw errors for rapid sequential calls', () => {
      const imageRef: SanityImageObject = {
        _type: 'image',
        asset: {
          _ref: 'image-RapidTestAbcDefGhiJklMnoPqr-1920x1080-jpg',
          _type: 'reference',
        },
      };

      expect(() => {
        for (let i = 0; i < 1000; i++) {
          urlFor(imageRef)
            .width(i % 2000)
            .url();
        }
      }).not.toThrow();
    });
  });

  describe('error handling', () => {
    it('should handle malformed image references gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      // Pass various malformed inputs
      const malformedInputs = [
        { _type: 'notAnImage' },
        { asset: 'not-a-valid-reference' },
        { random: 'object' },
      ];

      malformedInputs.forEach((input) => {
        expect(() => {
          const url = urlFor(input as unknown as SanityImageObject).url();
          // Should return empty string or valid URL, not crash
          expect(typeof url).toBe('string');
        }).not.toThrow();
      });

      consoleErrorSpy.mockRestore();
    });

    it('should log warnings in development for null sources', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      urlFor(null).url();

      // In development mode, should log warning
      if (process.env.NODE_ENV === 'development') {
        expect(consoleSpy).toHaveBeenCalledWith(
          expect.stringContaining('[Sanity Image] Received null/undefined'),
        );
      }

      consoleSpy.mockRestore();
    });
  });
});
