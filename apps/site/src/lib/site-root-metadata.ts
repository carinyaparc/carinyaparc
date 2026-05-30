import type { Metadata } from 'next';

import { viewport, generateMetadata as generateMetadataHelper } from './metadata';

export { viewport };

export const metadata: Metadata = await generateMetadataHelper({
  path: '/',
});
