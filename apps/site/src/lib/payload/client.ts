import 'server-only';

import config from '@payload-config';
import { getPayload } from 'payload';
import { cache } from 'react';

export const getPayloadClient = cache(async () => getPayload({ config }));
