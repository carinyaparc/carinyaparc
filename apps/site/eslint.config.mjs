import { nextJsConfig } from '@repo/eslint-config/next-js';
import prettier from 'eslint-plugin-prettier';

const eslintConfig = [
  ...nextJsConfig,
  {
    plugins: {
      prettier,
    },
    rules: {
      'react/no-unescaped-entities': 'off',
      'prettier/prettier': 'error',
      'react-hooks/set-state-in-effect': 'off',
      'turbo/no-undeclared-env-vars': [
        'warn',
        {
          allowList: [
            'NODE_ENV',
            'MAILERLITE_API_KEY',
            'NEXT_PUBLIC_GTM_ID',
            'NEXT_RUNTIME',
            'SESSION_SECRET',
            'PAYLOAD_SECRET',
            'DATABASE_URI',
            'NEXT_PUBLIC_SERVER_URL',
            'NEXT_PUBLIC_SENTRY_DSN',
            'SENTRY_DSN',
            'SENTRY_AUTH_TOKEN',
            'SENTRY_ORG',
            'SENTRY_PROJECT',
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
