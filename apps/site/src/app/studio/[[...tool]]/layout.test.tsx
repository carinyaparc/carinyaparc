/**
 * Unit Tests: Studio Layout
 *
 * Tests for the Sanity Studio nested layout component that provides
 * an isolated rendering environment with full viewport height.
 *
 * @module app/studio/layout.test
 * @see apps/site/src/app/studio/[[...tool]]/layout.tsx
 */

import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StudioLayout from './layout';

describe('StudioLayout', () => {
  /**
   * Test: Basic rendering
   * Verifies that the layout component renders children correctly
   */
  it('renders children', () => {
    render(
      <StudioLayout>
        <div data-testid="studio-content">Studio Content</div>
      </StudioLayout>,
    );
    expect(screen.getByTestId('studio-content')).toBeInTheDocument();
  });

  /**
   * Test: Full viewport height styles
   * Verifies that the layout applies full-height container styles
   */
  it('applies full viewport height styles', () => {
    const { container } = render(
      <StudioLayout>
        <div>Content</div>
      </StudioLayout>,
    );
    const layoutDiv = container.firstChild as HTMLElement;
    expect(layoutDiv).toHaveStyle({
      height: '100vh',
      width: '100%',
      overflow: 'hidden',
    });
  });

  /**
   * Test: No site header or footer
   * Verifies that the layout does not render site-level components
   */
  it('does not render site header or footer', () => {
    render(
      <StudioLayout>
        <div>Content</div>
      </StudioLayout>,
    );

    // Header should not be present (banner role)
    expect(screen.queryByRole('banner')).not.toBeInTheDocument();

    // Footer should not be present (contentinfo role)
    expect(screen.queryByRole('contentinfo')).not.toBeInTheDocument();

    // Navigation should not be present
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  /**
   * Test: Minimal DOM structure
   * Verifies that the layout creates a simple, minimal container
   */
  it('creates minimal DOM structure with single wrapper div', () => {
    const { container } = render(
      <StudioLayout>
        <div data-testid="child">Child</div>
      </StudioLayout>,
    );

    // Should have exactly one wrapper div between container and child
    const layoutDiv = container.firstChild as HTMLElement;
    expect(layoutDiv.tagName).toBe('DIV');
    expect(layoutDiv.firstChild).toHaveAttribute('data-testid', 'child');
  });

  /**
   * Test: TypeScript type safety
   * Verifies that the layout accepts proper React children prop
   */
  it('accepts ReactNode as children', () => {
    // Test with various React node types
    const { rerender } = render(
      <StudioLayout>
        <div>Text child</div>
      </StudioLayout>,
    );
    expect(screen.getByText('Text child')).toBeInTheDocument();

    rerender(
      <StudioLayout>
        <>Fragment child</>
      </StudioLayout>,
    );
    expect(screen.getByText('Fragment child')).toBeInTheDocument();

    rerender(<StudioLayout>Plain string child</StudioLayout>);
    expect(screen.getByText('Plain string child')).toBeInTheDocument();
  });

  /**
   * Test: No style conflicts
   * Verifies that inline styles are applied correctly without CSS conflicts
   */
  it('uses inline styles to avoid CSS cascade conflicts', () => {
    const { container } = render(
      <StudioLayout>
        <div>Content</div>
      </StudioLayout>,
    );
    const layoutDiv = container.firstChild as HTMLElement;

    // Verify inline styles are applied (not CSS classes)
    expect(layoutDiv.style.height).toBe('100vh');
    expect(layoutDiv.style.width).toBe('100%');
    expect(layoutDiv.style.overflow).toBe('hidden');

    // Should not have className (no CSS classes applied)
    expect(layoutDiv.className).toBe('');
  });
});
