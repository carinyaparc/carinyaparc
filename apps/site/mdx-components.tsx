import type { MDXComponents } from 'mdx/types';

import { MdxImage } from '@/components/mdx/MdxImage';

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    img: (props) => <MdxImage {...props} />,
    ...components,
  };
}
