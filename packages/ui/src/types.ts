/**
 * Shared type definitions for @repo/ui component library
 * Task: T1.2
 */

// Variant types (consistent across components)
export type Variant = 'default' | 'primary' | 'secondary' | 'destructive' | 'ghost' | 'link';
export type Size = 'xs' | 'sm' | 'default' | 'lg' | 'xl';
export type ColorIntent =
  | 'default'
  | 'primary'
  | 'secondary'
  | 'muted'
  | 'error'
  | 'success'
  | 'warning';

// Layout types
export type Align = 'start' | 'center' | 'end' | 'stretch';
export type Justify = 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
export type Direction = 'horizontal' | 'vertical';

// Responsive types
export type ResponsiveValue<T> =
  | T
  | {
      base?: T;
      sm?: T;
      md?: T;
      lg?: T;
      xl?: T;
      '2xl'?: T;
    };

// Common component prop patterns
export interface WithClassName {
  className?: string;
}

export interface WithChildren {
  children: React.ReactNode;
}

export interface WithVariant {
  variant?: Variant;
}

export interface WithSize {
  size?: Size;
}

// Component composition patterns
export interface CompoundComponentProps extends WithClassName, WithChildren {
  asChild?: boolean;
}
